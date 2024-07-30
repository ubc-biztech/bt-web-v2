import React from 'react'

const qaDict =
{
    "LinkedIn Profile (optional)": "https://www.linkedin.com/in/marcuskam20/",
    "If you are a senior student (3rd year and above) - you will be paired up to act as a mentor for a 1st or 2nd year student. This will give you the opportunity to become a \"Senior Mentee\". By participating in the mentorship program, you are expected to agree to volunteer as a senior mentor as well if a 1st or 2nd year student states and demonstrates a need for a senior student as their mentor.": "Tick this if you are a 1st or 2nd year student ;)",
    "Please upload your resume in the following format and indicate your intended role (Junior or Senior): Role_FirstName_LastName.pdf (i.e Senior_Kam_Marcus.pdf)": "https://drive.google.com/file/d/1EOvaSpJNmmEof2oa1aUfTn-hwaQMQL79/view?usp=drivesdk",
    "What motivated you to apply for this mentorship program? (500 characters max)": "Back in my first year, I applied for the tri-mentorship program with Biztech and had such an outstanding experience that I knew I had to apply again! I've always found applying for jobs and starting my own projects kind of intimidating, and my mentor was so experienced, and patient with all my questions. It was especially great that my upper year mentor was in the same year as me, and it helped to further personalize the guidance to a greater level.",
    "What does mentorship mean to you? What specific goals or areas of your personal or professional development are you hoping to address through this mentorship program (can include specific projects)? (750 characters max)": "To me, mentorship means the opportunity to connect someone more experienced, with someone who can learn from them. The relationship seemingly is one way, but often the upper year mentor is able to gain valuable experience as well through the act of teaching, explaining, and managing and younger mentee. Personally, I hope to be able to address the processes of job applications specific to the tech industry, and tackle harder side projects knowing I have a mentor I can refer to. For example, one project I'd really like to try is a web scraper that searches for houses on a real estate website. I don't have a lot of experience in this area, but I think it would be a great project to attempt.",
    "One of the goals of the mentorship program this year is to grow a tight-knit community of tech and business enthusiasts. How will you connect with other individuals in the program or spread the program's impact to the UBC community given the resources available to you? (450 characters max)": "When I was a junior mentee in first year, I made lots of great connections with other junior mentees during the events. I noticed that mentees had great experiences to share and we could refer our upper year mentors/professionals to each other based on what skills or experience they were looking for. I think overall being in the same program with like-minded people already fosters a great community within and outside of the program.",
    "Choose 1 to answer: Outside of school and career, what 3 topics are you likely to win a debate about? Why? --OR-- Open your Youtube account and check the categories (see image below). What are the top 3-5 categories that most represent you and your interests? Why? (300 characters max)": "The top three categories that represent me and my interests from Youtube are Roundnet (spikeball), Music, and Teamfight Tactics. Outside of school, I feel like you can always find me doing one of these three things. I thoroughly enjoy each of these and think they carry my mental health.",
    "Rank your top 3 industry interests: Entrepreneurship, software dev, gaming, data analytics, finance, consulting, sales and marketing, cyber security, product management, UI/UX Design, Other (name your own)": "1. Software Dev 2. Gaming 3. Product Management",
    "Workshops/Fireside chat topics you would be interested in (choose 4):": "Networking and Relationship Building, Time management and Productivity, Industry-Specific Workshops, Technology Skills",
    "Is there anything else you'd like us to know about you or your interests that might help us match you with a suitable mentor? (optional, 500 characters)": "My interests are music, soccer, spikeball, gaming, and I also speak Cantonese.",
    "Please confirm that you are free on the following dates of the program events.": "Friday October 27th (Evening) - Kick-Off Event, Friday January 26th (Evening) - Midway Event",
    "Please note we will be hosting workshop/social hybrid events with professionals. What days do you prefer?": "Wednesday evenings, Thursday evenings",
    "Any questions or concerns?": "Thanks for reviewing my application!"
};

const UserResponses = () => {
    return (
        <div className="text-white">
            {Object.entries(qaDict).map(([question, answer], index) => (
                <div key={index} className='mb-3'>
                    <p className="text-baby-blue p3">{question}</p>
                    <p className="text-white p3">{answer}</p>
                </div>
            ))}
        </div>
    );
};

export default UserResponses;

