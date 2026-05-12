import { motion } from "framer-motion";

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

const mockDataMap: Record<string, { desc: string, content: string[] }> = {
  "Web Development": {
    desc: "Master the art of building scalable, modern web applications from frontend to backend.",
    content: [
      "Our web development curriculum is designed to transform enthusiastic beginners into production-ready full-stack engineers.",
      "You will master HTML, CSS, JavaScript, React, Node.js, and database management through completely hands-on, realistic projects rather than boring theory."
    ]
  },
  "AI & Machine Learning": {
    desc: "Dive into the algorithms and neural networks shaping the future of technology.",
    content: [
      "Explore deep neural networks, natural language processing, and computer vision with industry-standard tooling.",
      "Get hands-on experience with TensorFlow, PyTorch, and real-world datasets to build your own intelligent models from scratch."
    ]
  },
  "Digital Marketing": {
    desc: "Understand the metrics, strategies, and platforms that drive modern continuous growth.",
    content: [
      "Learn how to optimize conversion rates, manage massive ad budgets, and build unbreakable brand loyalty globally.",
      "Advanced topics include programmatic SEO, content marketing, PPC lifecycle, and viral social media strategy."
    ]
  },
  "Data Science": {
    desc: "Extract actionable insights and predictive power from massive raw datasets.",
    content: [
      "Master Python data libraries such as Pandas, NumPy, and Matplotlib to manipulate gigabytes of information in seconds.",
      "Learn statistical modeling, data visualization, and how to tell compelling business stories with raw data."
    ]
  },
  "About Us": {
    desc: "We are a passionate team dedicated to making elite technical education universally accessible.",
    content: [
      "Founded in 2024, our platform was painstakingly built to bridge the massive gap between outrageously expensive university degrees and the frustrating struggles of self-taught coders.",
      "Our mission is simple: to empower dedicated professionals worldwide with cutting-edge skills in AI, Engineering, and Digital Business."
    ]
  },
  "Careers": {
    desc: "Join our fast-growing globally distributed team and help us build the ultimate learning platform.",
    content: [
      "We are always actively looking for passionate educators, brilliant engineers, and visionary designers to join our ranks.",
      "Enjoy completely flexible remote work, comprehensive platinum health benefits, and a team culture obsessively focused on continuous learning."
    ]
  },
  "Privacy Policy": {
    desc: "Your data privacy, security, and anonymity is our absolute utmost priority.",
    content: [
      "We securely encrypt all personal data using AES-256 protocols and we strictly vow to never sell your information to generic third-party advertisers.",
      "You have the absolute right to demand data deletion at any time. For full details on data retention and your consumer rights, please contact our privacy compliance team."
    ]
  },
  "Terms of Service": {
    desc: "The rules, regulations, and agreements governing your use of our platform.",
    content: [
      "By willingly accessing our platform, you agree to abide by our strict community code of conduct and unyielding academic integrity policies.",
      "All proprietary course materials, videos, and exams are legally protected intellectual property and strictly may not be redistributed without explicit written permission."
    ]
  }
};

const PlaceholderPage = ({ title, description = "This section is currently being updated with exciting new content. Please check back soon!" }: PlaceholderPageProps) => {
  const pageData = mockDataMap[title];
  const displayDesc = pageData?.desc || description;

  return (
    <main className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto space-y-6"
      >
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 neon-box">
          <span className="text-4xl text-primary font-bold">{title.charAt(0)}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight text-white mb-4">{title}</h1>
        <p className="text-xl text-primary/90 font-medium mb-8">
          {displayDesc}
        </p>
        
        {pageData && (
          <div className="mt-12 space-y-6 text-left glass-panel p-8 md:p-12 rounded-2xl">
            {pageData.content.map((paragraph, idx) => (
              <p key={idx} className="text-lg text-slate-300 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        )}
      </motion.div>
    </main>
  );
};

export default PlaceholderPage;
