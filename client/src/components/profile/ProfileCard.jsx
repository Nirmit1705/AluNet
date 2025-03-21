import React from "react";
import { Link } from "react-router-dom";
import { Briefcase, MapPin, Calendar, ExternalLink, Mail, BookOpen, Award } from "lucide-react";

const ProfileCard = ({
  name,
  role,
  avatar,
  company,
  location,
  experience,
  linkedIn,
  email,
  skills,
  education,
  interests,
}) => {
  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-scale-in">
      {/* Profile header with banner */}
      <div className="relative h-40 bg-gradient-to-r from-blue-500 to-indigo-600">
        <div className="absolute -bottom-16 left-8">
          <div className="relative">
            <img
              src={avatar}
              alt={name}
              className="w-32 h-32 rounded-xl object-cover border-4 border-white shadow-md"
            />
            <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        </div>
      </div>

      {/* Profile information */}
      <div className="pt-20 px-8 pb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold">{name}</h3>
            <p className="text-muted-foreground">{role}</p>
          </div>
          <Link
            to={`/messages/${name.toLowerCase().replace(/\s+/g, '-')}`}
            className="button-primary text-sm px-4 py-2"
          >
            Connect
          </Link>
        </div>

        <div className="space-y-1 mb-6">
          {company && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Briefcase className="h-4 w-4 mr-2" />
              <span>{company}</span>
            </div>
          )}
          {location && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{location}</span>
            </div>
          )}
          {experience && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{experience} years of experience</span>
            </div>
          )}
          {linkedIn && (
            <div className="flex items-center text-sm text-primary">
              <ExternalLink className="h-4 w-4 mr-2" />
              <a href={linkedIn} target="_blank" rel="noopener noreferrer">
                LinkedIn Profile
              </a>
            </div>
          )}
          <div className="flex items-center text-sm text-muted-foreground">
            <Mail className="h-4 w-4 mr-2" />
            <span>{email}</span>
          </div>
          {education && (
            <div className="flex items-center text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4 mr-2" />
              <span>{education}</span>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h4 className="font-medium mb-3">Skills</h4>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {interests && (
          <div>
            <h4 className="font-medium mb-3">Interests</h4>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-800/20 dark:text-purple-300"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard; 