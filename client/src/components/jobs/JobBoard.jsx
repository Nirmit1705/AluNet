import React, { useState, useEffect } from "react";
import {
  Briefcase,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronUp,
  BookmarkPlus,
  ExternalLink,
} from "lucide-react";

const JobBoard = () => {
  // Sample data of alumni that the current student follows
  const followedAlumni = [101, 103, 104]; // IDs of alumni the student follows

  const [searchTerm, setSearchTerm] = useState("");
  const [expandedJob, setExpandedJob] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [studentFollowing, setStudentFollowing] = useState([...followedAlumni]);
  const [userRole, setUserRole] = useState("student");

  // Sample job data with alumni information
  const jobListings = [
    {
      id: 1,
      title: "Software Engineer",
      company: "Google",
      location: "Mountain View, CA",
      type: "Full-time",
      salary: "$120,000 - $150,000",
      posted: "2 days ago",
      description:
        "We're looking for a Software Engineer to join our team and help build the next generation of Google products that are used by billions of people.",
      requirements: [
        "Bachelor's degree in Computer Science or related field",
        "3+ years of experience in software development",
        "Proficiency in JavaScript, TypeScript, and React",
        "Experience with backend technologies (Node.js, Python)",
        "Strong problem-solving and algorithmic thinking",
      ],
      postedBy: {
        id: 101,
        name: "Alex Johnson",
        role: "Senior Software Engineer",
        company: "Google",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      },
    },
    {
      id: 2,
      title: "Data Scientist",
      company: "Amazon",
      location: "Seattle, WA",
      type: "Full-time",
      salary: "$125,000 - $155,000",
      posted: "3 days ago",
      description:
        "Amazon is seeking a Data Scientist to join our team and help extract insights from large datasets to drive business decisions and improve customer experience.",
      requirements: [
        "Master's or PhD in Statistics, Mathematics, Computer Science, or related field",
        "3+ years of experience in data science or analytics",
        "Proficiency in Python, R, SQL, and data visualization tools",
        "Experience with machine learning and statistical modeling",
        "Strong communication skills to present findings to non-technical stakeholders",
      ],
      postedBy: {
        id: 103,
        name: "David Wong",
        role: "Data Science Manager",
        company: "Amazon",
        avatar: "https://randomuser.me/api/portraits/men/64.jpg",
      },
    },
  ];

  // Filter jobs to show only those posted by followed alumni
  const filteredJobs = jobListings.filter((job) =>
    followedAlumni.includes(job.postedBy.id)
  );

  const toggleJobExpanded = (jobId) => {
    setExpandedJob(expandedJob === jobId ? null : jobId);
  };

  const toggleSaveJob = (jobId) => {
    setSavedJobs((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  return (
    <div className="container-custom py-8">
      <h2 className="text-2xl font-bold mb-6">Job Opportunities</h2>

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
                        src={job.postedBy.avatar}
                        alt={job.postedBy.name}
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
                    <button
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveJob(job.id);
                      }}
                    >
                      <BookmarkPlus
                        className={`h-5 w-5 ${
                          savedJobs.includes(job.id)
                            ? "text-primary"
                            : "text-gray-500"
                        }`}
                      />
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
                  <div className="mb-4 flex items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <img
                      src={job.postedBy.avatar}
                      alt={job.postedBy.name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <p className="font-medium">{job.postedBy.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {job.postedBy.role} at {job.postedBy.company}
                      </p>
                    </div>
                  </div>

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

                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Application Link</h4>
                    <a
                      href={job.applicationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Apply Here
                    </a>
                  </div>

                  <div className="flex space-x-4">
                    <button className="button-primary flex items-center">
                      Apply Now
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </button>
                    <button
                      className={`button-secondary ${
                        savedJobs.includes(job.id) ? "bg-primary/20" : ""
                      }`}
                      onClick={() => toggleSaveJob(job.id)}
                    >
                      {savedJobs.includes(job.id) ? "Saved" : "Save for Later"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-medium mb-2">
              No job opportunities found
            </h3>
            <p className="text-muted-foreground">
              Try following more alumni to see job opportunities they post.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobBoard;