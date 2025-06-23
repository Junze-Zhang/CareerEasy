interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-center space-x-4">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          
          return (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-brand-light-blue text-black'
                    : isCompleted
                    ? 'bg-brand-navy text-white'
                    : 'bg-gray-300 text-gray-500'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>
              {stepNumber < totalSteps && (
                <div className={`w-12 h-0.5 mx-2 ${isCompleted ? 'bg-brand-navy' : 'bg-gray-300'}`}></div>
              )}
            </div>
          );
        })}
      </div>
      <div className="text-center mt-3">
        <span className="text-sm text-gray-600">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
    </div>
  );
}