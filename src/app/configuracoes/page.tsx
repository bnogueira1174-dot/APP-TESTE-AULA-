'use client'

import { Settings, Bell, Shield, Database, Palette, Globe, Save } from 'lucide-react'

export default function ConfiguracoesPage() {
  return (
    <div className="p-6 space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
        <p className="text-sm text-slate-500 mt-0.5">Gerencie as preferências do sistema</p>
      </div>

      {[
        {
          icon: Bell,
          title: 'Notificações',
          desc: 'Configure alertas e limites de velocidade, combustível e eventos',
          items: [
            { label: 'Limite de velocidade (km/h)', type: 'number', value: '80' },
            { label: 'Alerta de combustível (%)', type: 'number', value: '25' },
            { label: 'Motor ocioso — limite (min)', type: 'number', value: '30' },
          ],
        },
        {
          icon: Globe,
          title: 'Integração de APIs',
          desc: 'Configuração para APIs de GPS e telemetria',
          items: [
            { label: 'URL da API GPS', type: 'text', value: 'https://api.gps.example.com/v1' },
            { label: 'API Key', type: 'password', value: '••••••••••••••••' },
            { label: 'Intervalo de atualização (s)', type: 'number', value: '30' },
          ],
        },
        {
          icon: Database,
          title: 'Dados e Retenção',
          desc: 'Configurações de armazenamento e retenção de dados',
          items: [
            { label: 'Retenção de trajetos (dias)', type: 'number', value: '90' },
            { label: 'Retenção de vídeos (dias)', type: 'number', value: '30' },
          ],
        },
      ].map(({ icon: Icon, title, desc, items }) => (
        <div key={title} className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-start gap-3 mb-5">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Icon size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">{title}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((item) => (
              <div key={item.label}>
                <label className="text-xs font-medium text-slate-700 mb-1 block">{item.label}</label>
                <input
                  type={item.type}
                  defaultValue={item.value}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-slate-50"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Save size={14} />
          Salvar configurações
        </button>
      </div>
    </div>
  )
}
