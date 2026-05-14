import { useState, useEffect, useCallback } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';

type AIProvider = 'gemini' | 'openai' | 'anthropic';

interface Settings {
  provider: AIProvider;
  apiKey: string;
  model: string;
  enableNumberOneToggle: boolean;
}

const PROVIDERS = [
  { id: 'gemini' as AIProvider, name: 'Google Gemini', description: 'Fast and capable model from Google', defaultModel: 'gemini-2.5-flash' },
  { id: 'openai' as AIProvider, name: 'OpenAI', description: 'GPT models from OpenAI', defaultModel: 'gpt-4o-mini' },
  { id: 'anthropic' as AIProvider, name: 'Anthropic Claude', description: 'Claude models from Anthropic', defaultModel: 'claude-3-5-haiku-latest' },
];

export default function OptionsPage() {
  const [settings, setSettings] = useState<Settings>({
    provider: 'gemini',
    apiKey: '',
    model: 'gemini-2.5-flash',
    enableNumberOneToggle: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    console.log('[EduOverlay] Settings: loading from storage...');
    chrome.storage.local.get(['aiProvider', 'apiKey', 'aiModel', 'enableNumberOneToggle'], (result) => {
      const provider = (result.aiProvider as AIProvider) || 'gemini';
      const providerConfig = PROVIDERS.find((p) => p.id === provider);
      setSettings({
        provider,
        apiKey: result.apiKey || '',
        model: result.aiModel || providerConfig?.defaultModel || 'gemini-2.5-flash',
        enableNumberOneToggle: result.enableNumberOneToggle !== false,
      });
      setIsLoading(false);
      console.log('[EduOverlay] Settings: loaded, enableNumberOneToggle =', result.enableNumberOneToggle);
    });
  }, []);

  const handleProviderChange = useCallback((provider: AIProvider) => {
    const providerConfig = PROVIDERS.find((p) => p.id === provider);
    console.log('[EduOverlay] Settings: provider changed to', provider);
    setSettings((prev) => ({ ...prev, provider, model: providerConfig?.defaultModel || prev.model }));
  }, []);

  const handleSave = useCallback(async () => {
    console.log('[EduOverlay] Settings: saving...');
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      await chrome.storage.local.set({
        aiProvider: settings.provider,
        apiKey: settings.apiKey,
        aiModel: settings.model,
        enableNumberOneToggle: settings.enableNumberOneToggle
      });
      console.log('[EduOverlay] Settings: saved successfully');
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('[EduOverlay] Settings: save failed', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  }, [settings]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold">EduOverlay AI Settings</h1>
            <p className="text-sm text-slate-400">Configure your AI study assistant</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* AI Provider Card */}
        <Card variant="default" className="bg-slate-800">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            AI Provider
          </h2>

          <div className="space-y-3 mb-6">
            {PROVIDERS.map((provider) => (
              <label key={provider.id} className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${settings.provider === provider.id ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'}`}>
                <input type="radio" name="provider" value={provider.id} checked={settings.provider === provider.id} onChange={() => handleProviderChange(provider.id)} className="mt-1 w-4 h-4 text-blue-500" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{provider.name}</span>
                    {settings.provider === provider.id && <span className="text-xs text-blue-400 font-medium">Active</span>}
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{provider.description}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">Model</label>
            <select
              value={settings.model}
              onChange={(e) => setSettings((prev) => ({ ...prev, model: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {settings.provider === 'gemini' && <>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended)</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
              </>}
              {settings.provider === 'openai' && <>
                <option value="gpt-4o-mini">GPT-4o Mini (Recommended)</option>
                <option value="gpt-4o">GPT-4o</option>
              </>}
              {settings.provider === 'anthropic' && <>
                <option value="claude-3-5-haiku-latest">Claude 3.5 Haiku (Recommended)</option>
                <option value="claude-3-5-sonnet-latest">Claude 3.5 Sonnet</option>
              </>}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">API Key</label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={settings.apiKey}
                onChange={(e) => setSettings((prev) => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Enter your API key"
                className="w-full px-4 py-3 pr-12 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
              >
                {showApiKey ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm text-amber-200"><strong>Demo Lokal:</strong> API key disimpan di browser. Untuk produksi, gunakan backend proxy agar API key tidak diekspos ke halaman website.</p>
            </div>
          </div>
        </Card>

        {/* Keyboard Shortcuts Card */}
        <Card variant="default" className="bg-slate-800">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Keyboard Shortcuts
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl">
              <div>
                <p className="font-medium">Toggle Overlay</p>
                <p className="text-sm text-slate-400">Open or close the study overlay</p>
              </div>
              <kbd className="px-3 py-1.5 bg-slate-600 rounded-lg text-sm font-mono">Alt + 1</kbd>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl">
              <div>
                <p className="font-medium">Toggle with Number 1</p>
                <p className="text-sm text-slate-400">Open overlay by pressing "1" when not typing in input fields</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableNumberOneToggle}
                  onChange={(e) => setSettings((prev) => ({ ...prev, enableNumberOneToggle: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>

            <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600">
              <div className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-slate-300">
                    <strong>Custom Shortcut:</strong> Untuk mengubah shortcut Alt+1, buka <code className="bg-slate-600 px-1 py-0.5 rounded text-xs">chrome://extensions/shortcuts</code> dan ubah sesuai keinginan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* About Card */}
        <Card variant="default" className="bg-slate-800">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            About EduOverlay AI
          </h2>

          <div className="space-y-4 text-sm text-slate-300">
            <p><strong>EduOverlay AI</strong> adalah asisten belajar berbasis AI untuk membantu mahasiswa memahami materi kuliah. Extension ini dirancang untuk digunakan di forum pembelajaran, bukan untuk ujian, kuis, simulasi, atau aktivitas akademik yang dilarang.</p>

            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <p className="text-amber-200"><strong>Batasan Penggunaan:</strong></p>
              <ul className="mt-2 space-y-1 list-disc list-inside text-amber-200">
                <li>BUKAN untuk menjawab soal ujian, kuis, atau simulasi</li>
                <li>BUKAN untuk mem-bypass sistem keamanan website</li>
                <li>BUKAN untuk mendapatkan contekan saat ujian</li>
                <li>HANYA untuk belajar dan memahami materi</li>
              </ul>
            </div>

            <p className="text-slate-400">Version 1.0.0 • Built with React, TypeScript, and Tailwind CSS</p>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex gap-4">
          <Button variant="primary" onClick={handleSave} disabled={isSaving} className="flex-1">
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>

        {saveStatus === 'success' && (
          <p className="text-center text-green-400 text-sm">Settings saved successfully!</p>
        )}
        {saveStatus === 'error' && (
          <p className="text-center text-red-400 text-sm">Failed to save settings. Please try again.</p>
        )}
      </main>
    </div>
  );
}