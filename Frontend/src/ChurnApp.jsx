import React, { useEffect, useState } from 'react'
import { 
  FiDollarSign, 
  FiCalendar, 
  FiUser, 
  FiCreditCard, 
  FiWifi, 
  FiBarChart2,
  FiSettings,
  FiHome,
  FiClipboard,
  FiAlertCircle,
  FiCheckCircle,
  FiChevronLeft
} from 'react-icons/fi'
import { FaChartLine } from 'react-icons/fa'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

// Styled Input Component
const Input = ({ icon, label, ...props }) => (
  <div className="space-y-1">
    {label && <label className="text-sm font-medium text-slate-600">{label}</label>}
    <div className="flex items-center border border-slate-200 rounded-lg bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all shadow-sm">
      {icon && <span className="text-blue-500 mr-2">{icon}</span>}
      <input {...props} className="w-full bg-transparent text-slate-800 outline-none placeholder-slate-400" />
    </div>
  </div>
)

// Styled Select Component
const Select = ({ options = [], icon, label, ...props }) => (
  <div className="space-y-1">
    {label && <label className="text-sm font-medium text-slate-600">{label}</label>}
    <div className="flex items-center border border-slate-200 rounded-lg bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all shadow-sm">
      {icon && <span className="text-blue-500 mr-2">{icon}</span>}
      <select {...props} className="w-full bg-transparent text-slate-800 outline-none appearance-none">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  </div>
)

// PDF Viewer Component (iframe version)
const PDFViewer = ({ src }) => (
  <div className="w-full h-full rounded-xl border border-gray-700 overflow-hidden shadow-lg bg-gray-800">
    <div className="flex items-center justify-between bg-gray-800/50 p-3 border-b border-gray-700">
      <h3 className="font-medium text-gray-300 flex items-center gap-2">
        <FaChartLine className="text-indigo-400" />
        Churn Analysis Dashboard
      </h3>
      <span className="text-xs text-gray-500">Live Report</span>
    </div>
    <iframe
      src={src}
      width="100%"
      height="100%"
      className="min-h-[600px]"
      title="Churn PDF"
      style={{ border: "none" }}
    ></iframe>
  </div>
)

// Result Card Component
const ResultCard = ({ result, onBack, form }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg">
    <button 
      onClick={onBack}
      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 transition-colors"
    >
      <FiChevronLeft />
      Back to form
    </button>
    
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
        {result.churn === 'Yes' ? (
          <FiAlertCircle className="text-red-500" />
        ) : (
          <FiCheckCircle className="text-green-500" />
        )}
        Prediction Result
      </h3>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${result.churn === 'Yes' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
        {result.churn === 'Yes' ? 'High Churn Risk' : 'Low Churn Risk'}
      </span>
    </div>
    
    <div className="space-y-4">
      <div>
        <div className="flex justify-between text-sm text-slate-600 mb-2">
          <span>Churn Probability</span>
          <span className="font-medium">{(result.probability*100).toFixed(2)}%</span>
        </div>
        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className={`h-3 rounded-full ${result.probability > 0.7 ? 'bg-red-500' : result.probability > 0.4 ? 'bg-amber-500' : 'bg-green-500'}`} 
            style={{ width: `${result.probability*100}%` }}
          ></div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mt-6">
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
          <p className="text-xs text-blue-800 mb-1">Recommended Action</p>
          <p className="text-sm font-medium text-slate-800">
            {result.churn === 'Yes' ? 'Offer retention package' : 'Standard monitoring'}
          </p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
          <p className="text-xs text-blue-800 mb-1">Confidence Level</p>
          <p className="text-sm font-medium text-slate-800">
            {result.probability > 0.8 ? 'High' : result.probability > 0.5 ? 'Medium' : 'Low'}
          </p>
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t border-slate-200">
        <h4 className="text-sm font-medium text-slate-600 mb-3">Key Factors</h4>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            {form.Contract === 'Month-to-month' ? 'Month-to-month contract increases risk' : 'Long-term contract reduces risk'}
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            {form.OnlineSecurity === 'No' ? 'Lack of online security increases risk' : 'Online security reduces risk'}
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            {form.tenure < 12 ? 'New customer (under 1 year)' : `Loyal customer (${form.tenure} months)`}
          </li>
        </ul>
      </div>
    </div>
  </div>
)

export default function ChurnApp() {
  const [labels, setLabels] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [activeView, setActiveView] = useState('dashboard') // 'dashboard' or 'predictor'
  const [showResult, setShowResult] = useState(false)

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
      const payload = { 
        ...form, 
        TotalCharges: Number(form.TotalCharges), 
        MonthlyCharges: Number(form.MonthlyCharges), 
        tenure: Number(form.tenure), 
        SeniorCitizen: Number(form.SeniorCitizen) 
      }
      const res = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Prediction failed - please check your inputs')
      const data = await res.json()
      setResult(data)
      setShowResult(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Navigation Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 shadow-sm z-10">
        <div className="p-6">
          <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
            <FiClipboard className="text-blue-500" />
            ChurnPredict
          </h1>
        </div>
        <nav className="mt-6">
          <button 
            onClick={() => { setActiveView('dashboard'); setShowResult(false) }}
            className={`flex items-center gap-3 w-full px-6 py-3 text-left transition-colors ${activeView === 'dashboard' ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-500' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <FiHome className="text-lg" />
            Dashboard
          </button>
          <button 
            onClick={() => { setActiveView('predictor'); setShowResult(false) }}
            className={`flex items-center gap-3 w-full px-6 py-3 text-left transition-colors ${activeView === 'predictor' ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-500' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <FiSettings className="text-lg" />
            Churn Predictor
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {activeView === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Customer Churn Analytics</h2>
                <p className="text-slate-600">Monitor and predict customer churn patterns</p>
              </div>
            </div>
            <PDFViewer src="/churn.pdf" />
          </div>
        )}

        {activeView === 'predictor' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Churn Prediction Tool</h2>
                <p className="text-slate-600">Enter customer details to predict churn risk</p>
              </div>
              <button 
                onClick={() => setActiveView('dashboard')}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-all flex items-center gap-2"
              >
                <FiChevronLeft />
                Back to Dashboard
              </button>
            </div>

            {!showResult ? (
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Financial Section */}
                  <div className="md:col-span-2 space-y-4 p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-medium text-slate-800 flex items-center gap-2">
                      <FiDollarSign className="text-blue-500" />
                      Financial Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input 
                        name="TotalCharges" type="number" value={form.TotalCharges} onChange={handleChange} 
                        label="Total Charges ($)" icon={<FiDollarSign size={16} />} required 
                      />
                      <Input 
                        name="MonthlyCharges" type="number" value={form.MonthlyCharges} onChange={handleChange} 
                        label="Monthly Charges ($)" icon={<FiDollarSign size={16} />} required 
                      />
                      <Input 
                        name="tenure" type="number" value={form.tenure} onChange={handleChange} 
                        label="Tenure (months)" icon={<FiCalendar size={16} />} required 
                      />
                    </div>
                  </div>

                  {/* Customer Profile */}
                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-medium text-slate-800 flex items-center gap-2">
                      <FiUser className="text-blue-500" />
                      Customer Profile
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <Select name="gender" value={form.gender} onChange={handleChange} options={genderOptions} label="Gender" icon={<FiUser size={16} />} />
                      <Select name="SeniorCitizen" value={form.SeniorCitizen} onChange={handleChange} options={[0,1]} label="Senior Citizen" />
                      {['Partner','Dependents'].map(f => (
                        <Select key={f} name={f} value={form[f]} onChange={handleChange} options={yesNo} label={f} />
                      ))}
                    </div>
                                      {/* Contract */}
                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-medium text-slate-800 flex items-center gap-2">
                      <FiCreditCard className="text-blue-500" />
                      Contract & Payment
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {labels && ['PaymentMethod','Contract','InternetService'].map(f => (
                        <Select key={f} name={f} value={form[f]} onChange={handleChange} options={labels[f]} label={f.replace(/([A-Z])/g, ' $1').trim()} />
                      ))}
                    </div>
                  </div>
                  </div>

                  {/* Services */}
                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-medium text-slate-800 flex items-center gap-2">
                      <FiWifi className="text-blue-500" />
                      Services
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {['PhoneService','MultipleLines','OnlineSecurity','OnlineBackup','DeviceProtection','TechSupport','StreamingTV','StreamingMovies','PaperlessBilling'].map(f => (
                        <Select key={f} name={f} value={form[f]} onChange={handleChange} options={yesNo} label={f.replace(/([A-Z])/g, ' $1').trim()} />
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2 flex justify-end pt-4">
                    <button type="submit" disabled={loading} className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all flex items-center gap-2 shadow-md">
                      {loading ? 'Predicting...' : 'Predict Churn'}
                    </button>
                  </div>

                  {error && <p className="md:col-span-2 text-red-600">{error}</p>}
                </form>
              </div>
            ) : (
              <ResultCard result={result} onBack={() => setShowResult(false)} form={form} />
            )}
          </div>
        )}
      </main>
    </div>
  )
}
