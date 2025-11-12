import React from 'react'
import { useLanguage } from '../LanguageContext'
import { useTranslation } from '../i18n'

export default function Carbon(){
  const { language } = useLanguage()
  const t = useTranslation(language)

  return (
    <main className="page">
      <header className="page-header">
        <h1>{t.carbonProfile}</h1>
      </header>
      <section className="card">
        <h2>{t.myActions}</h2>
        <p>{t.submitProofs}</p>
      </section>
    </main>
  )
}
