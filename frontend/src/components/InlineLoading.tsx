import logo from '../assets/svg/logo-utama.svg'
import './InlineLoading.css'

export default function InlineLoading() {
  return (
    <div className="inline-loading">
      <img src={logo} alt="" className="inline-loading__logo" />
      <p className="inline-loading__text">
        Loading<span> .</span><span> .</span><span> .</span>
      </p>
    </div>
  )
}
