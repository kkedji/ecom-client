import React, { useState } from 'react'

export default function SignUp() {
  const [formData, setFormData] = useState({
    pseudo: '',
    nom: '',
    prenom: '',
    email: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
  }

  return (
    <div className="form-container">
      <div className="form-logo">
        <h1>ēcom</h1>
      </div>
      
      <p className="form-subtitle">S'inscrire en tant que passager</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <div style={{position: 'relative'}}>
            <span style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '16px',
              color: '#757575'
            }}>
              👤
            </span>
            <input
              type="text"
              name="pseudo"
              placeholder="Pseudo"
              value={formData.pseudo}
              onChange={handleChange}
              className="form-input"
              style={{paddingLeft: '48px'}}
              required
            />
          </div>
        </div>
        
        <div className="form-group">
          <div style={{position: 'relative'}}>
            <span style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '16px',
              color: '#757575'
            }}>
              📝
            </span>
            <input
              type="text"
              name="nom"
              placeholder="Nom"
              value={formData.nom}
              onChange={handleChange}
              className="form-input"
              style={{paddingLeft: '48px'}}
              required
            />
          </div>
        </div>
        
        <div className="form-group">
          <div style={{position: 'relative'}}>
            <span style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '16px',
              color: '#757575'
            }}>
              📱
            </span>
            <input
              type="text"
              name="prenom"
              placeholder="Prénom(s)"
              value={formData.prenom}
              onChange={handleChange}
              className="form-input"
              style={{paddingLeft: '48px'}}
              required
            />
          </div>
        </div>
        
        <div className="form-group">
          <div style={{position: 'relative'}}>
            <span style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '16px',
              color: '#757575'
            }}>
              ✉️
            </span>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              style={{paddingLeft: '48px'}}
              required
            />
          </div>
        </div>
        
        <button type="submit" className="form-button">
          S'inscrire
        </button>
      </form>
    </div>
  )
}