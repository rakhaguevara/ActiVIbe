import logo from '../assets/svg/logo-utama.svg'
import './LoadingScreen.css'

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <img src={logo} alt="ActiVibe" className="loading-screen__logo" />
      <p className="loading-screen__text">
        Loading<span> .</span><span> .</span><span> .</span>
      </p>
    </div>
  )
}
