import React, { useState } from "react";
import { Briefcase, MapPin, Clock, Search, Filter, ExternalLink, Calendar, ChevronDown, ChevronUp, BookmarkPlus } from "lucide-react";

// Sample job data
const jobListings = [
  {
    id: 1,
    title: "Software Engineer",
    company: "Google",
    location: "Mountain View, CA",
    type: "Full-time",
    salary: "$120,000 - $150,000",
    posted: "2 days ago",
    description: "We're looking for a Software Engineer to join our team and help build the next generation of Google products that are used by billions of people.",
    requirements: [
      "Bachelor's degree in Computer Science or related field",
      "3+ years of experience in software development",
      "Proficiency in JavaScript, TypeScript, and React",
      "Experience with backend technologies (Node.js, Python)",
      "Strong problem-solving and algorithmic thinking",
    ],
    logo: "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
    category: "Engineering",
  },
  {
    id: 2,
    title: "Product Manager",
    company: "Microsoft",
    location: "Redmond, WA",
    type: "Full-time",
    salary: "$130,000 - $160,000",
    posted: "1 week ago",
    description: "Join Microsoft as a Product Manager to drive the vision, strategy, and execution of innovative products that impact millions of users worldwide.",
    requirements: [
      "Bachelor's degree in Business, Computer Science, or related field",
      "5+ years of experience in product management",
      "Strong analytical and problem-solving skills",
      "Excellent communication and stakeholder management",
      "Technical background preferred",
    ],
    logo: "https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b?ver=5c31",
    category: "Product",
  },
  {
    id: 3,
    title: "Data Scientist",
    company: "Amazon",
    location: "Seattle, WA",
    type: "Full-time",
    salary: "$125,000 - $155,000",
    posted: "3 days ago",
    description: "Amazon is seeking a Data Scientist to join our team and help extract insights from large datasets to drive business decisions and improve customer experience.",
    requirements: [
      "Master's or PhD in Statistics, Mathematics, Computer Science, or related field",
      "3+ years of experience in data science or analytics",
      "Proficiency in Python, R, SQL, and data visualization tools",
      "Experience with machine learning and statistical modeling",
      "Strong communication skills to present findings to non-technical stakeholders",
    ],
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png",
    category: "Data Science",
  },
  {
    id: 4,
    title: "UX Designer",
    company: "Apple",
    location: "Cupertino, CA",
    type: "Full-time",
    salary: "$110,000 - $140,000",
    posted: "5 days ago",
    description: "Join Apple's design team to create intuitive and elegant user experiences for products that are used by millions of people around the world.",
    requirements: [
      "Bachelor's degree in Design, HCI, or related field",
      "4+ years of experience in UX/UI design",
      "Strong portfolio demonstrating user-centered design process",
      "Proficiency in design tools (Figma, Sketch, Adobe XD)",
      "Experience with design systems and accessibility standards",
    ],
    logo: "https://www.apple.com/ac/structured-data/images/knowledge_graph_logo.png",
    category: "Design",
  },
  {
    id: 5,
    title: "Marketing Manager",
    company: "Netflix",
    location: "Los Gatos, CA",
    type: "Full-time",
    salary: "$115,000 - $145,000",
    posted: "1 week ago",
    description: "Netflix is looking for a Marketing Manager to develop and execute marketing strategies to promote our original content and drive subscriber growth.",
    requirements: [
      "Bachelor's degree in Marketing, Business, or related field",
      "5+ years of experience in marketing, preferably in entertainment or tech",
      "Strong understanding of digital marketing channels and analytics",
      "Experience with campaign planning and execution",
      "Excellent creative and analytical skills",
    ],
    logo: "https://cdn.cookielaw.org/logos/dd6b162f-1a32-456a-9cfe-897231c7763c/4345ea78-053c-46d2-b11e-09adaef973dc/Netflix_Logo_PMS.png",
    category: "Marketing",
  },
];

// Filter options
const categories = ["All", "Engineering", "Product", "Data Science", "Design", "Marketing"];
const jobTypes = ["All", "Full-time", "Part-time", "Contract", "Internship"];
const locations = ["All", "Remote", "On-site", "Hybrid"];

const JobBoard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [expandedJob, setExpandedJob] = useState(null);

  // Filter jobs based on search and filter criteria
  const filteredJobs = jobListings.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || job.category === selectedCategory;

    const matchesType = selectedType === "All" || job.type === selectedType;

    // For location, we're simplifying by just checking if the location contains the selected location
    const matchesLocation =
      selectedLocation === "All" ||
      job.location.toLowerCase().includes(selectedLocation.toLowerCase());

    return matchesSearch && matchesCategory && matchesType && matchesLocation;
  });

  const toggleJobExpanded = (jobId) => {
    if (expandedJob === jobId) {
      setExpandedJob(null);
    } else {
      setExpandedJob(jobId);
    }
  };

  return (
    <div className="container-custom py-8">
      {/* Search and filters */}
      <div className="glass-card rounded-xl p-6 mb-8 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search jobs, companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/50 focus:outline-none"
            />
          </div>
          
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/50 focus:outline-none appearance-none bg-select-arrow bg-no-repeat bg-right-4"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "All" ? "All Categories" : category}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/50 focus:outline-none appearance-none bg-select-arrow bg-no-repeat bg-right-4"
            >
              {jobTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "All" ? "All Job Types" : type}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/50 focus:outline-none appearance-none bg-select-arrow bg-no-repeat bg-right-4"
            >
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location === "All" ? "All Locations" : location}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Job listings */}
      <div className="space-y-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div 
              key={job.id} 
              className="glass-card rounded-xl overflow-hidden animate-fade-in transition-all duration-300"
            >
              <div 
                className="p-6 cursor-pointer"
                onClick={() => toggleJobExpanded(job.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-white p-2 flex items-center justify-center overflow-hidden">
                      <img 
                        src={job.logo} 
                        alt={job.company} 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">{job.title}</h3>
                      <p className="text-muted-foreground">{job.company}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="inline-flex items-center text-xs bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 rounded-full text-gray-800 dark:text-gray-200">
                          <MapPin className="h-3 w-3 mr-1" />
                          {job.location}
                        </span>
                        <span className="inline-flex items-center text-xs bg-blue-100 dark:bg-blue-900/20 px-2.5 py-0.5 rounded-full text-blue-800 dark:text-blue-300">
                          <Briefcase className="h-3 w-3 mr-1" />
                          {job.type}
                        </span>
                        <span className="inline-flex items-center text-xs bg-green-100 dark:bg-green-900/20 px-2.5 py-0.5 rounded-full text-green-800 dark:text-green-300">
                          <Calendar className="h-3 w-3 mr-1" />
                          {job.posted}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <BookmarkPlus className="h-5 w-5 text-gray-500" />
                    </button>
                    {expandedJob === job.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>
              
              {expandedJob === job.id && (
                <div className="p-6 border-t border-gray-200 dark:border-gray-800 animate-fade-in">
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-muted-foreground text-sm">
                      {job.description}
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Requirements</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {job.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Salary Range</h4>
                    <p className="text-primary font-medium">{job.salary}</p>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button className="button-primary flex items-center">
                      Apply Now
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </button>
                    <button className="button-secondary">
                      Save for Later
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-medium mb-2">No job listings found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobBoard; 