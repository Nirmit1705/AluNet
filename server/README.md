# Student-Alumni-Interaction Server

## Alumni Education Fields

When working with alumni education data, note that each education entry should include:

1. `institution` - The specific school/college attended (e.g., "College of Engineering")
2. `university` - The university that institution is part of (e.g., "Stanford University")

Both fields should be included even when they might contain the same value for some cases.

Example education object:
```javascript
{
  institution: "School of Computer Science",
  university: "Carnegie Mellon University",
  degree: "Master of Science",
  fieldOfStudy: "Computer Science",
  startYear: 2018,
  endYear: 2020
}
```

The system maintains both fields separately to support various display formats and filtering capabilities.