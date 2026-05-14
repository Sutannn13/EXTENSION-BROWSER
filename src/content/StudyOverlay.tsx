import { useState, useEffect, useCallback, useRef } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import Textarea from '../components/Textarea';
import FileUploader from '../components/FileUploader';
import ChatBubble from '../components/ChatBubble';
import LoadingDots from '../components/LoadingDots';
import SafetyBanner from '../components/SafetyBanner';
import { parseFile } from '../lib/document/parseFile';
import { chunkText } from '../lib/document/chunkText';
import { rankChunks } from '../lib/rag/rankChunks';
import { buildContext } from '../lib/rag/buildContext';
import { classifyPage } from '../lib/safety/pageClassifier';
import { isQuestionDisallowed } from '../lib/safety/academicIntegrity';
import { cn } from '../lib/utils/cn';
import type { ChatMessage } from '../lib/ai/types';
import type { TextChunk } from '../lib/document/chunkText';

const QUICK_PROMPTS = [
  { id: 'summarize', label: 'Ringkas materi', prompt: 'Ringkas materi utama dari file ini dalam poin-poin yang mudah dipahami.' },
  { id: 'explain', label: 'Jelaskan sederhana', prompt: 'Jelaskan konsep utama dari materi ini dengan analogi sederhana.' },
  { id: 'flashcard', label: 'Buat flashcard', prompt: 'Buat 10 flashcard tanya-jawab dari materi ini untuk latihan belajar.' },
  { id: 'concept', label: 'Tanya konsep', prompt: 'Bantu saya memahami konsep yang paling penting dari materi ini.' },
  { id: 'practice', label: 'Latihan pemahaman', prompt: 'Buat 5 pertanyaan latihan berbasis pemahaman dari materi ini, jangan langsung beri jawaban sebelum saya mencoba.' },
];

export default function StudyOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [pageClassification, setPageClassification] = useState<{ isRestricted: boolean; matchedKeywords: string[] } | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number; chunks: TextChunk[] } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Page classification on mount
  useEffect(() => {
    console.log('[EduOverlay] Classifying page...');
    const classification = classifyPage({
      url: window.location.href,
      title: document.title,
      headings: Array.from(document.querySelectorAll('h1, h2, h3')).map((el) => el.textContent || ''),
    });
    setPageClassification(classification);

    if (classification.isRestricted) {
      console.log('[EduOverlay] Restricted page detected:', classification.matchedKeywords);
    } else {
      console.log('[EduOverlay] Normal page - overlay is active');
    }
  }, []);

  // Listen for toggle events from content script
  useEffect(() => {
    const handleToggle = () => {
      console.log('[EduOverlay] Toggle event received');
      setIsOpen((prev) => {
        const newState = !prev;
        console.log('[EduOverlay] Overlay state changed to:', newState ? 'open' : 'closed');
        return newState;
      });
    };

    const handleOpen = () => {
      console.log('[EduOverlay] Open event received');
      setIsOpen(true);
    };

    const handleClose = () => {
      console.log('[EduOverlay] Close event received');
      setIsOpen(false);
    };

    window.addEventListener('eduoverlay:toggle', handleToggle);
    window.addEventListener('eduoverlay:open', handleOpen);
    window.addEventListener('eduoverlay:close', handleClose);

    return () => {
      window.removeEventListener('eduoverlay:toggle', handleToggle);
      window.removeEventListener('eduoverlay:open', handleOpen);
      window.removeEventListener('eduoverlay:close', handleClose);
    };
  }, []);

  // Auto-scroll chat container
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileUpload = useCallback(async (file: File) => {
    setError(null);
    setIsParsing(true);
    try {
      const maxSize = 20 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error(`File terlalu besar. Maksimal 20MB.`);
      }
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      const allowedExtensions = ['pdf', 'docx', 'txt', 'md', 'csv'];
      if (!allowedExtensions.includes(extension)) {
        throw new Error(`Format file tidak didukung.`);
      }
      const text = await parseFile(file);
      if (!text || text.trim().length === 0) {
        throw new Error('File appears to be empty or unreadable. PDF ini kemungkinan hasil scan/gambar.');
      }
      const chunks = chunkText(text);
      if (chunks.length === 0) {
        throw new Error('Failed to process file content');
      }
      console.log('[EduOverlay] File parsed:', file.name, '-', text.length, 'characters,', chunks.length, 'chunks');
      setUploadedFile({ name: file.name, size: file.size, chunks });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `File "${file.name}" berhasil diunggah. Saya sudah memproses ${chunks.length} bagian materi (${text.length} karakter).`, timestamp: Date.now() },
      ]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal memproses file';
      console.error('[EduOverlay] File upload error:', errorMsg);
      setError(errorMsg);
    } finally {
      setIsParsing(false);
    }
  }, []);

  const handleFileDelete = useCallback(() => {
    console.log('[EduOverlay] Deleting uploaded file');
    setUploadedFile(null);
    setMessages([]);
    setError(null);
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || !uploadedFile) return;
    const userMessage: ChatMessage = { role: 'user', content: inputValue.trim(), timestamp: Date.now() };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);
    try {
      const disallowedCheck = isQuestionDisallowed(userMessage.content);
      if (disallowedCheck.isDisallowed) {
        setMessages((prev) => [...prev, { role: 'assistant', content: disallowedCheck.message, timestamp: Date.now() }]);
        setIsLoading(false);
        return;
      }
      const relevantChunks = rankChunks(userMessage.content, uploadedFile.chunks, 5);
      if (relevantChunks.length === 0) {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'Materi yang diunggah belum cukup menjawab pertanyaan ini. Coba unggah materi yang lebih lengkap atau tanyakan bagian lain.', timestamp: Date.now() }]);
        setIsLoading(false);
        return;
      }
      const context = buildContext(relevantChunks);
      const response = await chrome.runtime.sendMessage({ type: 'AI_REQUEST', prompt: userMessage.content, context });
      if (response.success) {
        setMessages((prev) => [...prev, { role: 'assistant', content: response.response, timestamp: Date.now() }]);
      } else {
        throw new Error(response.error || 'Failed to get response');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan';
      console.error('[EduOverlay] Send message error:', errorMessage);
      setError(errorMessage);
      setMessages((prev) => [...prev, { role: 'assistant', content: `Maaf, terjadi kesalahan: ${errorMessage}`, timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, uploadedFile]);

  const handleQuickPrompt = useCallback((prompt: string) => {
    setInputValue(prompt);
  }, []);

  const handleClearChat = useCallback(() => {
    console.log('[EduOverlay] Clearing chat');
    setMessages([]);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    console.log('[EduOverlay] Close button clicked');
    setIsOpen(false);
  }, []);

  const isRestrictedPage = pageClassification?.isRestricted ?? false;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'fixed bottom-6 right-6 z-[2147483647] w-14 h-14 rounded-full',
          'bg-gradient-to-br from-blue-500 to-cyan-500',
          'shadow-lg hover:shadow-xl',
          'flex items-center justify-center',
          'transition-all duration-200 hover:scale-110',
          'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2',
          isOpen && 'hidden'
        )}
        aria-label="Toggle EduOverlay AI"
      >
        {isRestrictedPage ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        )}
      </button>

      {/* Overlay Panel */}
      <div className={cn(
        'fixed bottom-6 right-6 z-[2147483647]',
        'w-[420px] max-w-[calc(100vw-32px)] max-h-[80vh]',
        'bg-slate-900 rounded-2xl shadow-2xl',
        'flex flex-col overflow-hidden',
        'transition-all duration-300',
        isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">EduOverlay AI</h2>
              <p className="text-xs text-slate-400">{isRestrictedPage ? 'Dinonaktifkan di halaman evaluasi' : 'Mode Belajar Aktif'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open(chrome.runtime.getURL('options/options.html'), '_blank')}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Settings"
              title="Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              aria-label={isMinimized ? 'Expand' : 'Minimize'}
              title={isMinimized ? 'Expand' : 'Minimize'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <button
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Close EduOverlay AI"
              title="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <>
            {/* Safety Banner for restricted pages */}
            {isRestrictedPage && (
              <SafetyBanner message="EduOverlay AI dinonaktifkan di halaman evaluasi/ujian untuk menjaga integritas akademik." />
            )}

            <div className="flex-1 overflow-hidden flex flex-col">
              {/* File Upload Section */}
              {!isRestrictedPage && (
                <div className="p-4 border-b border-slate-700">
                  {uploadedFile ? (
                    <Card variant="default" className="bg-slate-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{uploadedFile.name}</p>
                            <p className="text-xs text-slate-400">{(uploadedFile.size / 1024).toFixed(1)} KB • {uploadedFile.chunks.length} chunks</p>
                          </div>
                        </div>
                        <button
                          onClick={handleFileDelete}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                          aria-label="Delete file"
                          title="Hapus file"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </Card>
                  ) : (
                    <FileUploader onFileSelect={handleFileUpload} isLoading={isParsing} accept=".pdf,.docx,.txt,.md,.csv" maxSize={20 * 1024 * 1024} />
                  )}
                </div>
              )}

              {/* Quick Prompts */}
              {!isRestrictedPage && uploadedFile && (
                <div className="px-4 py-2 border-b border-slate-700">
                  <p className="text-xs text-slate-400 mb-2">Mode Belajar:</p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_PROMPTS.map((qp) => (
                      <button key={qp.id} onClick={() => handleQuickPrompt(qp.prompt)} className="px-3 py-1.5 text-xs font-medium bg-slate-700 text-slate-300 rounded-full hover:bg-blue-600 hover:text-white transition-colors">
                        {qp.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              {!isRestrictedPage && (
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <p className="text-slate-400 text-sm">{uploadedFile ? 'Ajukan pertanyaan tentang materi yang diunggah' : 'Upload materi kuliah terlebih dahulu untuk mulai belajar.'}</p>
                    </div>
                  ) : (
                    messages.map((message, index) => <ChatBubble key={index} message={message} />)
                  )}
                  {isLoading && <LoadingDots />}
                </div>
              )}

              {/* Input Area */}
              {!isRestrictedPage && (
                <div className="p-4 border-t border-slate-700">
                  <div className="flex gap-2">
                    <Textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                      placeholder="Ajukan pertanyaan tentang materi..."
                      disabled={!uploadedFile || isLoading}
                      className="flex-1"
                      rows={1}
                    />
                    <Button onClick={handleSendMessage} disabled={!inputValue.trim() || !uploadedFile || isLoading} variant="primary" className="px-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </Button>
                  </div>
                  {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
                  <div className="mt-2 flex justify-between">
                    <button onClick={handleClearChat} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Hapus chat</button>
                    <span className="text-xs text-slate-500">Tekan Enter untuk kirim</span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}