"use client";
export default function LoadingSpinner() {
  const size = 100; // Size of the sword loader
  return (
    <div className="flex justify-center">
      <div className="flex flex-col justify-center items-center">
        <svg
          fill="#B45309FF"
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="0">
            <animate
              id="spinner_kIfO"
              begin="0;spinner_xBIM.end"
              attributeName="r"
              calcMode="spline"
              dur="2s"
              values="0;11"
              keySplines=".52,.6,.25,.99"
              fill="freeze"
            />
            <animate
              begin="0;spinner_xBIM.end"
              attributeName="opacity"
              calcMode="spline"
              dur="2s"
              values="1;0"
              keySplines=".52,.6,.25,.99"
              fill="freeze"
            />
          </circle>
          <circle cx="12" cy="12" r="0">
            <animate
              id="spinner_Pbsh"
              begin="spinner_kIfO.begin+0.2s"
              attributeName="r"
              calcMode="spline"
              dur="2s"
              values="0;11"
              keySplines=".52,.6,.25,.99"
              fill="freeze"
            />
            <animate
              begin="spinner_kIfO.begin+0.2s"
              attributeName="opacity"
              calcMode="spline"
              dur="2s"
              values="1;0"
              keySplines=".52,.6,.25,.99"
              fill="freeze"
            />
          </circle>
          <circle cx="12" cy="12" r="0">
            <animate
              id="spinner_xBIM"
              begin="spinner_kIfO.begin+0.4s"
              attributeName="r"
              calcMode="spline"
              dur="2s"
              values="0;11"
              keySplines=".52,.6,.25,.99"
              fill="freeze"
            />
            <animate
              begin="spinner_kIfO.begin+0.4s"
              attributeName="opacity"
              calcMode="spline"
              dur="2s"
              values="1;0"
              keySplines=".52,.6,.25,.99"
              fill="freeze"
            />
          </circle>
        </svg>
        {/* <p>Loading...</p> */}
      </div>
    </div>
  );
}
