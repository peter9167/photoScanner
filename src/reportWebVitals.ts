type ReportHandler = (metric: any) => void;

const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Web vitals reporting can be implemented here if needed
    console.log('Web vitals reporting enabled');
  }
};

export default reportWebVitals;
