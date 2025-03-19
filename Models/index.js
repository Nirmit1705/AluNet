const mongoose = require('mongoose');

const Student = require('./Student');
const Alumni = require('./Alumni');
const Message = require('./Message');
const JobPosting = require('./JobPosting');
const Mentorship = require('./Mentorship');
const MentorshipSession = require('./MentorshipSession');
const MentorshipFeedback = require('./MentorshipFeedback');
const Notification = require('./Notification');

module.exports = { Student, Alumni, Message, JobPosting, Mentorship,MentorshipSession ,MentorshipFeedback,Notification};
