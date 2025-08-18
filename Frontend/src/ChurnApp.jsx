import React, { useEffect, useState } from 'react'
import { FaDollarSign, FaCalendarAlt, FaUser, FaCreditCard, FaNetworkWired } from 'react-icons/fa'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://telelco-churn-predictor.onrender.com'

const Input = ({ icon, ...props }) => (
  <div className="flex items-center border border-slate-700 rounded-2xl bg-slate-900/60 px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500">
    {icon && <span className="text-indigo-400 mr-2">{icon}</span>}
    <input {...props} className="w-full bg-transparent text-slate-100 outline-none" />
  </div>
)

const Select = ({ options = [], icon, ...props }) => (
  <div className="flex items-center border border-slate-700 rounded-2xl bg-slate-900/60 px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500">
    {icon && <span className="text-indigo-400 mr-2">{icon}</span>}
    <select {...props} className="w-full bg-transparent text-slate-100 outline-none">
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
)

const SectionTitle = ({ children }) => (
  <h3 className="text-gray-300 font-semibold text-lg col-span-full">{children}</h3>
)

export default function ChurnApp() {
  const [labels, setLabels] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    TotalCharges: '',
    MonthlyCharges: '',
    tenure: '',
    gender: 'Male',
    SeniorCitizen: 0,
    Partner: 'No',
    Dependents: 'No',
    PhoneService: 'Yes',
    MultipleLines: 'No',
    OnlineSecurity: 'No',
    OnlineBackup: 'No',
    DeviceProtection: 'No',
    TechSupport: 'No',
    StreamingTV: 'No',
    StreamingMovies: 'No',
    PaperlessBilling: 'Yes',
    PaymentMethod: 'Electronic check',
    Contract: 'Month-to-month',
    InternetService: 'Fiber optic',
  })

  const yesNo = ['Yes', 'No']
  const genderOptions = ['Male', 'Female']

  useEffect(() => {
    fetch(`${API_BASE}/labels`).then(r => r.json()).then(setLabels).catch(()=>{})
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? (checked ? 1 : 0) : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const payload = { ...form, TotalCharges: Number(form.TotalCharges), MonthlyCharges: Number(form.MonthlyCharges), tenure: Number(form.tenure), SeniorCitizen: Number(form.SeniorCitizen) }
      const res = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Prediction API failed')
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-4xl bg-slate-800/90 rounded-3xl p-8 shadow-2xl">
        <h1 className="text-4xl font-bold text-center text-indigo-400 mb-8">Telecom Churn Predictor</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <SectionTitle>Financial Info</SectionTitle>
          <Input name="TotalCharges" type="number" value={form.TotalCharges} onChange={handleChange} placeholder="Total Charges" icon={<FaDollarSign />} required />
          <Input name="MonthlyCharges" type="number" value={form.MonthlyCharges} onChange={handleChange} placeholder="Monthly Charges" icon={<FaDollarSign />} required />
          <Input name="tenure" type="number" value={form.tenure} onChange={handleChange} placeholder="Tenure (months)" icon={<FaCalendarAlt />} required />

          <SectionTitle>Customer Info</SectionTitle>
          <Select name="gender" value={form.gender} onChange={handleChange} options={genderOptions} icon={<FaUser />} />
          <Select name="SeniorCitizen" value={form.SeniorCitizen} onChange={handleChange} options={[0,1]} />

          <SectionTitle>Services</SectionTitle>
          {['Partner','Dependents','PhoneService','MultipleLines','OnlineSecurity','OnlineBackup','DeviceProtection','TechSupport','StreamingTV','StreamingMovies','PaperlessBilling'].map(f => (
            <div key={f} className="flex flex-col">
              <label className="text-slate-300 mb-1">{f}</label>
              <Select name={f} value={form[f]} onChange={handleChange} options={yesNo} icon={<FaNetworkWired />} />
            </div>
          ))}


          <SectionTitle>Contract & Payment</SectionTitle>
          {labels && ['PaymentMethod','Contract','InternetService'].map(f => (
            <Select key={f} name={f} value={form[f]} onChange={handleChange} options={labels[f]} icon={<FaCreditCard />} />
          ))}

          <div className="col-span-full flex justify-center mt-4">
            <button type="submit" disabled={loading} className="px-8 py-3 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold shadow-lg transition-all duration-300">
              {loading ? 'Predicting...' : 'Predict Churn'}
            </button>
          </div>

        </form>

        {error && <p className="text-red-400 mt-6 text-center text-lg">{error}</p>}

        {result && (
          <div className="mt-8 bg-slate-900/70 p-6 rounded-2xl border border-slate-700 shadow-lg animate-fadeIn">
            <h2 className="text-2xl font-bold text-indigo-300 mb-3 text-center">Prediction Result</h2>
            <p className="text-slate-200 mb-3 text-center">Churn: <span className="font-semibold text-lg">{result.churn}</span></p>
            <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-4 bg-indigo-500" style={{ width: `${result.probability*100}%`, transition: 'width 0.5s ease-in-out' }}></div>
            </div>
            <p className="text-slate-300 mt-2 text-center">Probability: {(result.probability*100).toFixed(2)}%</p>
          </div>
        )}

      </div>
    </div>
  )
}
