import React from "react";
import { MessageSquare, ShieldCheck, Clock } from "lucide-react";

const FeedbackSide = () => {
  const points = [
    {
      title: "We Read Every Message",
      desc: "Your feedback is reviewed by our product and support teams.",
      icon: <MessageSquare className="text-yellow-400" />
    },
    {
      title: "Your Data Is Safe",
      desc: "We respect your privacy and never share your information.",
      icon: <ShieldCheck className="text-yellow-400" />
    },
    {
      title: "Quick Response",
      desc: "We usually respond within 24–48 working hours.",
      icon: <Clock className="text-yellow-400" />
    }
  ];

  return (
    <div className="w-full space-y-6">

      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-1">
          Why Share Feedback?
        </h3>
        <p className="text-gray-400 text-sm">
          Your thoughts help us improve InventOPredict and serve you better.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {points.map((p, i) => (
          <div
            key={i}
            className="bg-zinc-900 border border-yellow-400/20 p-5 rounded-lg text-center
            transition hover:-translate-y-1 hover:border-yellow-400/40"
          >
            <div className="text-3xl mb-3 flex justify-center">
              {p.icon}
            </div>
            <h4 className="font-medium text-white text-base">{p.title}</h4>
            <p className="text-xs text-gray-400 mt-2">{p.desc}</p>
          </div>
        ))}
      </div>

      {/* Support Note */}
      <div className="bg-zinc-900 border border-yellow-400/20 rounded-lg p-5">
        <h4 className="font-semibold text-yellow-400 mb-2 text-sm">
          Need Immediate Help?
        </h4>
        <p className="text-gray-400 text-xs">
          For urgent issues, mention <b>“URGENT”</b> in your message and our
          support team will prioritize it.
        </p>
      </div>

    </div>
  );
};

export default FeedbackSide;