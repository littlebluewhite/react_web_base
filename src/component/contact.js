import "../SCSS/contact.css"
import {useGetIndexPicture} from "../function/usePackage";
import {Link} from "react-router-dom";

function Contact(){
    const indexImage = useGetIndexPicture()

    return(
        <div className={"contact"}>
            <div className="head">
                <Link to={{pathname: "/"}}>
                    <img src={indexImage} alt="index"/>
                </Link>
            </div>
            <div className="title">
                Contact Us
            </div>
            <div className="title2">
                Drop Us a Message
            </div>
            <div className="text1">
                <img src={indexImage} alt="index"/>
                <span>is committed to the smart city solutions,</span>
                    <span>and here are the applications you must need to know:</span>
            </div>
            <div className="text2">
                <span>Please feel free to say anything to us.</span>
                <br/>
                    <span>Our staff will reply any message as soon as possible.</span>
            </div>
            <div className="contactMethod">
                <div className="method">
                    <svg width="4.75rem" height="4.75rem" viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M75.5 56.4167V71.15C75.5005 72.2049 75.1008 73.2207 74.3816 73.9925C73.6625 74.7642 72.6773 75.2345 71.625 75.3083C69.8042 75.4333 68.3167 75.5 67.1667 75.5C30.3458 75.5 0.5 45.6542 0.5 8.83333C0.5 7.68333 0.5625 6.19583 0.691667 4.375C0.76551 3.32268 1.23575 2.33754 2.00751 1.61837C2.77927 0.899195 3.79509 0.499523 4.85 0.500001H19.5833C20.1002 0.499478 20.5987 0.691079 20.9822 1.03759C21.3657 1.38409 21.6066 1.86076 21.6583 2.375C21.7542 3.33333 21.8417 4.09583 21.925 4.675C22.7531 10.4538 24.45 16.0743 26.9583 21.3458C27.3542 22.1792 27.0958 23.175 26.3458 23.7083L17.3542 30.1333C22.8519 42.9436 33.0606 53.1523 45.8708 58.65L52.2875 49.675C52.5498 49.3083 52.9324 49.0453 53.3687 48.9319C53.805 48.8184 54.2673 48.8617 54.675 49.0542C59.9459 51.5578 65.5649 53.2505 71.3417 54.075C71.9208 54.1583 72.6833 54.25 73.6333 54.3417C74.1468 54.3943 74.6225 54.6357 74.9681 55.0191C75.3138 55.4024 75.5048 55.9005 75.5042 56.4167H75.5Z"
                            fill="#495B7C"/>
                    </svg>
                    <br/>
                        +886 02 2XXX-XXXX
                </div>
                <div className="method">
                    <svg width="7.875rem" height="6.25rem" viewBox="0 0 126 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M125.5 12.5C125.5 5.625 119.875 0 113 0H13C6.125 0 0.5 5.625 0.5 12.5V87.5C0.5 94.375 6.125 100 13 100H113C119.875 100 125.5 94.375 125.5 87.5V12.5ZM113 12.5L63 43.75L13 12.5H113ZM113 87.5H13V25L63 56.25L113 25V87.5Z"
                            fill="#495B7C"/>
                    </svg>
                    <br/>
                        mkt-serv@deltaww.com
                </div>
            </div>
        </div>
    )
}

export {Contact}
