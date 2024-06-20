import { NetworkViewer } from 'network-viewer';

const handleImageChange = (e) => {
    console.log(e)
  }
const HarAnalyze = () => {
    return (
    <NetworkViewer onRequestSelect={handleImageChange}/>
        
    )
}

export default HarAnalyze;