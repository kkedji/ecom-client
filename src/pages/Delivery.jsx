import React from 'react'
import { useLanguage } from '../LanguageContext'
import { useTranslation } from '../i18n'

export default function Delivery(){
  const { language } = useLanguage()
  const t = useTranslation(language)

  return (
    <main className="page">
      <header className="page-header">
        <h1>{t.ecoDelivery}</h1>
      </header>
      <section className="card">
        <h2>{t.orderDelivery}</h2>
        <p>{t.vehicleChoice}</p>
      </section>

      <section className="card">
        <h2>{t.tracking}</h2>
        <p>{t.realTimeTracking}</p>
      </section>
    </main>
  )
}
