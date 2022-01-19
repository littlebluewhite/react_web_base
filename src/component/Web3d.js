import "../SCSS/web3d.css"
function Web3d(){
    return(
        <div className={"web3d"}>
            <div className={"iframeContainer"}>
                <iframe src="http://20.48.113.161/ocms3d" title={"web3d"}/>
            </div>
            <div className={"cctv"}>
                <div className={"upContainer"}>
                    <iframe src="http://127.0.0.1:8083/stream/player/1" title={"cctv1"}/>
                    <iframe src="http://127.0.0.1:8083/stream/player/2" title={"cctv2"}/>
                    <iframe src="http://127.0.0.1:8083/stream/player/3" title={"cctv3"}/>
                    <iframe src="http://127.0.0.1:8083/stream/player/4" title={"cctv4"}/>
                    <iframe src="http://127.0.0.1:8083/stream/player/5" title={"cctv5"}/>
                    <iframe src="http://127.0.0.1:8083/stream/player/2" title={"cctv6"}/>
                </div>
                <div className={"downContainer"}>
                    <iframe src="http://127.0.0.1:8083/stream/player/1" title={"cctv7"}/>
                </div>
            </div>
        </div>
    )
}

export {Web3d}
