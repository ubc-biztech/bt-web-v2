import React, { useState } from 'react';


interface Props {
    setIsDelete: React.Dispatch<React.SetStateAction<boolean>>,
    bizEvent: string
}

// The Popup that displays when the 'Delete Event' button is clicked
// setIsDelete: is the state modifier passed in so that when the 'x' button is clicked
// bizEvent: the name of the event which was clicked (string)
const DeletePopup: React.FC<Props> = ({ setIsDelete, bizEvent}) => {

    return (
        <div className='container mx-auto text-center'>
            <button onClick={() => setIsDelete(false)}>
                <h4 className='text-white absolute top-1 right-3'>&times;</h4>
            </button>
            <p className='p3 text-white'>Are you sure you want to delete</p>
            <h5 className='text-white my-3'>[ {bizEvent} ]</h5>
            <p className='p3 underline text-white'>This action cannot be undone</p>
            <button className="my-4" onClick={() => void (0)}>
                {/* the import of the svg wasn't working for some reason so I just used the svg of the button * can change later if needed * */}
                <svg width="256" height="40" viewBox="0 0 256 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="256" height="46" rx="10" fill="#FF8282" />
                    <path d="M38.4213 16.125H33.5776C33.4829 15.7555 33.474 15.3692 33.5514 14.9957C33.6288 14.6222 33.7905 14.2713 34.0242 13.9698C34.2579 13.6683 34.5574 13.4242 34.8999 13.2561C35.2423 13.0881 35.6186 13.0004 36.0001 13C36.3814 13.0006 36.7576 13.0884 37.0999 13.2565C37.4421 13.4247 37.7415 13.6688 37.9751 13.9703C38.2086 14.2717 38.3702 14.6226 38.4476 14.996C38.5249 15.3694 38.5159 15.7556 38.4213 16.125Z" fill="#324269" />
                    <path d="M29.125 17.375C28.7935 17.375 28.4755 17.2433 28.2411 17.0089C28.0067 16.7745 27.875 16.4565 27.875 16.125C27.875 15.7935 28.0067 15.4755 28.2411 15.2411C28.4755 15.0067 28.7935 14.875 29.125 14.875H42.875C43.2065 14.875 43.5245 15.0067 43.7589 15.2411C43.9933 15.4755 44.125 15.7935 44.125 16.125C44.125 16.4565 43.9933 16.7745 43.7589 17.0089C43.5245 17.2433 43.2065 17.375 42.875 17.375H29.125Z" fill="#324269" />
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M41.625 33.625C41.9565 33.625 42.2745 33.4933 42.5089 33.2589C42.7433 33.0245 42.875 32.7065 42.875 32.375V19.25C42.875 18.9185 42.7433 18.6005 42.5089 18.3661C42.2745 18.1317 41.9565 18 41.625 18H30.375C30.0435 18 29.7255 18.1317 29.4911 18.3661C29.2567 18.6005 29.125 18.9185 29.125 19.25V32.375C29.125 32.7065 29.2567 33.0245 29.4911 33.2589C29.7255 33.4933 30.0435 33.625 30.375 33.625H41.625ZM39.125 21.125C39.125 20.9592 39.1908 20.8003 39.3081 20.6831C39.4253 20.5658 39.5842 20.5 39.75 20.5C39.9158 20.5 40.0747 20.5658 40.1919 20.6831C40.3092 20.8003 40.375 20.9592 40.375 21.125V29.875C40.375 30.0408 40.3092 30.1997 40.1919 30.3169C40.0747 30.4342 39.9158 30.5 39.75 30.5C39.5842 30.5 39.4253 30.4342 39.3081 30.3169C39.1908 30.1997 39.125 30.0408 39.125 29.875V21.125ZM36 20.5C35.8342 20.5 35.6753 20.5658 35.5581 20.6831C35.4408 20.8003 35.375 20.9592 35.375 21.125V29.875C35.375 30.0408 35.4408 30.1997 35.5581 30.3169C35.6753 30.4342 35.8342 30.5 36 30.5C36.1658 30.5 36.3247 30.4342 36.4419 30.3169C36.5592 30.1997 36.625 30.0408 36.625 29.875V21.125C36.625 20.9592 36.5592 20.8003 36.4419 20.6831C36.3247 20.5658 36.1658 20.5 36 20.5ZM31.625 21.125C31.625 20.9592 31.6908 20.8003 31.8081 20.6831C31.9253 20.5658 32.0842 20.5 32.25 20.5C32.4158 20.5 32.5747 20.5658 32.6919 20.6831C32.8092 20.8003 32.875 20.9592 32.875 21.125V29.875C32.875 30.0408 32.8092 30.1997 32.6919 30.3169C32.5747 30.4342 32.4158 30.5 32.25 30.5C32.0842 30.5 31.9253 30.4342 31.8081 30.3169C31.6908 30.1997 31.625 30.0408 31.625 29.875V21.125Z" fill="#324269" />
                    <path d="M61.9689 17.832C63.1423 17.832 64.1716 18.0613 65.0569 18.52C65.9529 18.9787 66.6409 19.6347 67.1209 20.488C67.6116 21.3307 67.8569 22.312 67.8569 23.432C67.8569 24.552 67.6116 25.5333 67.1209 26.376C66.6409 27.208 65.9529 27.8533 65.0569 28.312C64.1716 28.7707 63.1423 29 61.9689 29H58.0649V17.832H61.9689ZM61.8889 27.096C63.0623 27.096 63.9689 26.776 64.6089 26.136C65.2489 25.496 65.5689 24.5947 65.5689 23.432C65.5689 22.2693 65.2489 21.3627 64.6089 20.712C63.9689 20.0507 63.0623 19.72 61.8889 19.72H60.3049V27.096H61.8889ZM77.7737 24.376C77.7737 24.696 77.7524 24.984 77.7097 25.24H71.2297C71.283 25.88 71.507 26.3813 71.9017 26.744C72.2964 27.1067 72.7817 27.288 73.3577 27.288C74.1897 27.288 74.7817 26.9307 75.1337 26.216H77.5497C77.2937 27.0693 76.803 27.7733 76.0777 28.328C75.3524 28.872 74.4617 29.144 73.4057 29.144C72.5524 29.144 71.7844 28.9573 71.1017 28.584C70.4297 28.2 69.9017 27.6613 69.5177 26.968C69.1444 26.2747 68.9577 25.4747 68.9577 24.568C68.9577 23.6507 69.1444 22.8453 69.5177 22.152C69.891 21.4587 70.4137 20.9253 71.0857 20.552C71.7577 20.1787 72.531 19.992 73.4057 19.992C74.2484 19.992 75.0004 20.1733 75.6617 20.536C76.3337 20.8987 76.851 21.416 77.2137 22.088C77.587 22.7493 77.7737 23.512 77.7737 24.376ZM75.4537 23.736C75.443 23.16 75.235 22.7013 74.8297 22.36C74.4244 22.008 73.9284 21.832 73.3417 21.832C72.787 21.832 72.3177 22.0027 71.9337 22.344C71.5604 22.6747 71.331 23.1387 71.2457 23.736H75.4537ZM81.6487 17.16V29H79.4087V17.16H81.6487ZM92.1018 24.376C92.1018 24.696 92.0805 24.984 92.0378 25.24H85.5578C85.6111 25.88 85.8351 26.3813 86.2298 26.744C86.6245 27.1067 87.1098 27.288 87.6858 27.288C88.5178 27.288 89.1098 26.9307 89.4618 26.216H91.8778C91.6218 27.0693 91.1311 27.7733 90.4058 28.328C89.6805 28.872 88.7898 29.144 87.7338 29.144C86.8805 29.144 86.1125 28.9573 85.4298 28.584C84.7578 28.2 84.2298 27.6613 83.8458 26.968C83.4725 26.2747 83.2858 25.4747 83.2858 24.568C83.2858 23.6507 83.4725 22.8453 83.8458 22.152C84.2191 21.4587 84.7418 20.9253 85.4138 20.552C86.0858 20.1787 86.8591 19.992 87.7338 19.992C88.5765 19.992 89.3285 20.1733 89.9898 20.536C90.6618 20.8987 91.1791 21.416 91.5418 22.088C91.9151 22.7493 92.1018 23.512 92.1018 24.376ZM89.7818 23.736C89.7711 23.16 89.5631 22.7013 89.1578 22.36C88.7525 22.008 88.2565 21.832 87.6698 21.832C87.1151 21.832 86.6458 22.0027 86.2618 22.344C85.8885 22.6747 85.6591 23.1387 85.5738 23.736H89.7818ZM96.3448 21.976V26.264C96.3448 26.5627 96.4141 26.7813 96.5528 26.92C96.7021 27.048 96.9475 27.112 97.2888 27.112H98.3288V29H96.9208C95.0328 29 94.0888 28.0827 94.0888 26.248V21.976H93.0328V20.136H94.0888V17.944H96.3448V20.136H98.3288V21.976H96.3448ZM108.18 24.376C108.18 24.696 108.159 24.984 108.116 25.24H101.636C101.689 25.88 101.913 26.3813 102.308 26.744C102.703 27.1067 103.188 27.288 103.764 27.288C104.596 27.288 105.188 26.9307 105.54 26.216H107.956C107.7 27.0693 107.209 27.7733 106.484 28.328C105.759 28.872 104.868 29.144 103.812 29.144C102.959 29.144 102.191 28.9573 101.508 28.584C100.836 28.2 100.308 27.6613 99.9239 26.968C99.5506 26.2747 99.3639 25.4747 99.3639 24.568C99.3639 23.6507 99.5506 22.8453 99.9239 22.152C100.297 21.4587 100.82 20.9253 101.492 20.552C102.164 20.1787 102.937 19.992 103.812 19.992C104.655 19.992 105.407 20.1733 106.068 20.536C106.74 20.8987 107.257 21.416 107.62 22.088C107.993 22.7493 108.18 23.512 108.18 24.376ZM105.86 23.736C105.849 23.16 105.641 22.7013 105.236 22.36C104.831 22.008 104.335 21.832 103.748 21.832C103.193 21.832 102.724 22.0027 102.34 22.344C101.967 22.6747 101.737 23.1387 101.652 23.736H105.86ZM115.867 19.64V22.44H119.627V24.216H115.867V27.176H120.107V29H113.627V17.816H120.107V19.64H115.867ZM125.839 26.936L128.079 20.136H130.463L127.183 29H124.463L121.199 20.136H123.599L125.839 26.936ZM139.961 24.376C139.961 24.696 139.94 24.984 139.897 25.24H133.417C133.471 25.88 133.695 26.3813 134.089 26.744C134.484 27.1067 134.969 27.288 135.545 27.288C136.377 27.288 136.969 26.9307 137.321 26.216H139.737C139.481 27.0693 138.991 27.7733 138.265 28.328C137.54 28.872 136.649 29.144 135.593 29.144C134.74 29.144 133.972 28.9573 133.289 28.584C132.617 28.2 132.089 27.6613 131.705 26.968C131.332 26.2747 131.145 25.4747 131.145 24.568C131.145 23.6507 131.332 22.8453 131.705 22.152C132.079 21.4587 132.601 20.9253 133.273 20.552C133.945 20.1787 134.719 19.992 135.593 19.992C136.436 19.992 137.188 20.1733 137.849 20.536C138.521 20.8987 139.039 21.416 139.401 22.088C139.775 22.7493 139.961 23.512 139.961 24.376ZM137.641 23.736C137.631 23.16 137.423 22.7013 137.017 22.36C136.612 22.008 136.116 21.832 135.529 21.832C134.975 21.832 134.505 22.0027 134.121 22.344C133.748 22.6747 133.519 23.1387 133.433 23.736H137.641ZM146.508 20.008C147.564 20.008 148.418 20.344 149.068 21.016C149.719 21.6773 150.044 22.6053 150.044 23.8V29H147.804V24.104C147.804 23.4 147.628 22.8613 147.276 22.488C146.924 22.104 146.444 21.912 145.836 21.912C145.218 21.912 144.727 22.104 144.364 22.488C144.012 22.8613 143.836 23.4 143.836 24.104V29H141.596V20.136H143.836V21.24C144.135 20.856 144.514 20.5573 144.972 20.344C145.442 20.12 145.954 20.008 146.508 20.008ZM154.782 21.976V26.264C154.782 26.5627 154.852 26.7813 154.99 26.92C155.14 27.048 155.385 27.112 155.726 27.112H156.766V29H155.358C153.47 29 152.526 28.0827 152.526 26.248V21.976H151.47V20.136H152.526V17.944H154.782V20.136H156.766V21.976H154.782ZM169.086 17.832V19.64H164.43V22.504H167.998V24.28H164.43V29H162.19V17.832H169.086ZM174.61 29.144C173.757 29.144 172.989 28.9573 172.306 28.584C171.624 28.2 171.085 27.6613 170.69 26.968C170.306 26.2747 170.114 25.4747 170.114 24.568C170.114 23.6613 170.312 22.8613 170.706 22.168C171.112 21.4747 171.661 20.9413 172.354 20.568C173.048 20.184 173.821 19.992 174.674 19.992C175.528 19.992 176.301 20.184 176.994 20.568C177.688 20.9413 178.232 21.4747 178.626 22.168C179.032 22.8613 179.234 23.6613 179.234 24.568C179.234 25.4747 179.026 26.2747 178.61 26.968C178.205 27.6613 177.65 28.2 176.946 28.584C176.253 28.9573 175.474 29.144 174.61 29.144ZM174.61 27.192C175.016 27.192 175.394 27.096 175.746 26.904C176.109 26.7013 176.397 26.4027 176.61 26.008C176.824 25.6133 176.93 25.1333 176.93 24.568C176.93 23.7253 176.706 23.08 176.258 22.632C175.821 22.1733 175.282 21.944 174.642 21.944C174.002 21.944 173.464 22.1733 173.026 22.632C172.6 23.08 172.386 23.7253 172.386 24.568C172.386 25.4107 172.594 26.0613 173.01 26.52C173.437 26.968 173.97 27.192 174.61 27.192ZM183.117 21.512C183.405 21.0427 183.779 20.6747 184.237 20.408C184.707 20.1413 185.24 20.008 185.837 20.008V22.36H185.245C184.541 22.36 184.008 22.5253 183.645 22.856C183.293 23.1867 183.117 23.7627 183.117 24.584V29H180.877V20.136H183.117V21.512ZM195.586 24.376C195.586 24.696 195.565 24.984 195.522 25.24H189.042C189.096 25.88 189.32 26.3813 189.714 26.744C190.109 27.1067 190.594 27.288 191.17 27.288C192.002 27.288 192.594 26.9307 192.946 26.216H195.362C195.106 27.0693 194.616 27.7733 193.89 28.328C193.165 28.872 192.274 29.144 191.218 29.144C190.365 29.144 189.597 28.9573 188.914 28.584C188.242 28.2 187.714 27.6613 187.33 26.968C186.957 26.2747 186.77 25.4747 186.77 24.568C186.77 23.6507 186.957 22.8453 187.33 22.152C187.704 21.4587 188.226 20.9253 188.898 20.552C189.57 20.1787 190.344 19.992 191.218 19.992C192.061 19.992 192.813 20.1733 193.474 20.536C194.146 20.8987 194.664 21.416 195.026 22.088C195.4 22.7493 195.586 23.512 195.586 24.376ZM193.266 23.736C193.256 23.16 193.048 22.7013 192.642 22.36C192.237 22.008 191.741 21.832 191.154 21.832C190.6 21.832 190.13 22.0027 189.746 22.344C189.373 22.6747 189.144 23.1387 189.058 23.736H193.266ZM200.917 26.936L203.157 20.136H205.541L202.261 29H199.541L196.277 20.136H198.677L200.917 26.936ZM215.039 24.376C215.039 24.696 215.018 24.984 214.975 25.24H208.495C208.549 25.88 208.773 26.3813 209.167 26.744C209.562 27.1067 210.047 27.288 210.623 27.288C211.455 27.288 212.047 26.9307 212.399 26.216H214.815C214.559 27.0693 214.069 27.7733 213.343 28.328C212.618 28.872 211.727 29.144 210.671 29.144C209.818 29.144 209.05 28.9573 208.367 28.584C207.695 28.2 207.167 27.6613 206.783 26.968C206.41 26.2747 206.223 25.4747 206.223 24.568C206.223 23.6507 206.41 22.8453 206.783 22.152C207.157 21.4587 207.679 20.9253 208.351 20.552C209.023 20.1787 209.797 19.992 210.671 19.992C211.514 19.992 212.266 20.1733 212.927 20.536C213.599 20.8987 214.117 21.416 214.479 22.088C214.853 22.7493 215.039 23.512 215.039 24.376ZM212.719 23.736C212.709 23.16 212.501 22.7013 212.095 22.36C211.69 22.008 211.194 21.832 210.607 21.832C210.053 21.832 209.583 22.0027 209.199 22.344C208.826 22.6747 208.597 23.1387 208.511 23.736H212.719ZM218.914 21.512C219.202 21.0427 219.576 20.6747 220.034 20.408C220.504 20.1413 221.037 20.008 221.634 20.008V22.36H221.042C220.338 22.36 219.805 22.5253 219.442 22.856C219.09 23.1867 218.914 23.7627 218.914 24.584V29H216.674V20.136H218.914V21.512Z" fill="#324269" />
                </svg>

            </button>
        </div>
    );
};

export default DeletePopup;