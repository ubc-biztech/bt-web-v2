interface FeedbackFormProps {
  feedbackLink: string;
  headerText: string;
}

const FeedbackForm = ({ feedbackLink, headerText }: FeedbackFormProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-center mb-4">{headerText}</h2>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <iframe
          src={feedbackLink}
          className="w-full h-[60vh] border-none"
          title="Feedback Form"
        />
      </div>
    </div>
  );
};

export default FeedbackForm;
