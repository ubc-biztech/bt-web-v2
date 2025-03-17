// utilities for handling productx scoring data

type GradesData = {
    grades: Record<string, { N: string }>;
};

type ScoringMetric = {
    [K in ReturnType<typeof fetchMetrics>[number]]: number;
};

const fetchRubricContents = (metrics: string[]) => {
    return {
        [metrics[0]]: [
            "The project lacks creativity and innovation, offering a solution that is overly common or uninspired.",
            "The project shows minimal creativity, relying heavily on conventional ideas or solutions.",
            "The project is fairly creative, using existing ideas in a new way but lacks substantial innovation.",
            "The project presents a creative and somewhat unique solution. It introduces a fresh perspective or approach, though not entirely groundbreaking.",
            "The project offers a highly original and innovative solution that significantly stands out. The idea is novel and pushes boundaries in a meaningful way.",
        ],
        [metrics[1]]: [
            "The project is barely functional or non-functional, with severe technical issues and a lack of understanding of basic coding principles.",
            "The project has significant technical flaws, with multiple bugs or issues that hinder its functionality. The understanding of technical requirements is limited.",
            "The project is functional but has some noticeable bugs or areas where the code could be improved. The implementation shows a basic understanding of technical principles.",
            "The project is technically solid with only minor issues. The code works as intended with few bugs or errors and demonstrates a good understanding of the technical requirements.",
            "The project is technically sound with flawless or near-flawless functionality. The code is well-written, structured, and demonstrates a solid understanding of development practices.",
        ],
        [metrics[2]]: [
            "The project provides a very poor or unusable experience, with a design that is confusing, difficult to navigate, or highly inaccessible.",
            "The project has a poor user experience, with a design that is not intuitive and poses significant usability challenges for users.",
            "The project offers an acceptable user experience, with a design that is somewhat intuitive but has noticeable usability issues or areas that could be more user-friendly.",
            "The project has a very good user experience, with a design that is mostly intuitive and user-friendly, though there may be minor areas for improvement.",
            "The project provides an exceptional user experience. The design is highly intuitive, accessible, and aesthetically pleasing, offering users a seamless interaction.",
        ],
        [metrics[3]]: [
            "The project fails to effectively address the problem, offering a solution that is irrelevant, poorly thought out, or non-existent.",
            "The project addresses a problem poorly, with a solution that is incomplete, not well-executed, or fails to tackle the core issue effectively.",
            "The project addresses a problem adequately, with a solution that works but is somewhat superficial or incomplete. There is room for significant improvement in problem analysis or execution.",
            "The project addresses a problem well, offering a solid solution that is mostly effective and well-thought-out, though it may lack depth in some areas.",
            "The project effectively addresses a significant problem with a clear, impactful, and well-executed solution. The problem-solving approach is thorough and demonstrates a deep understanding of the issue.",
        ],
        [metrics[4]]: [
            "The team struggles to present their project, with highly unclear communication, major confusion, or an inability to explain key aspects of the project. The presentation is unpolished and disorganized.",
            "The team presents their project poorly, with unclear explanations, confusion, or significant gaps in communication. The presentation is unpolished.",
            "The team presents their project adequately, explaining the core aspects but with noticeable gaps or areas of confusion. The presentation is clear but lacks polish.",
            "The team presents their project very well, with clear explanations and good communication, though there may be minor areas where the presentation could be more polished.",
            "The team presents their project exceptionally well, clearly and engagingly explaining all aspects of the problem, solution, and technical implementation. The presentation is polished and professional.",
        ],
    };
};

const fetchMetrics = () => {
    return [
        "Originality & Creativity",
        "Technical Implementation",
        "User Experience (UX)",
        "Problem-Solving",
        "Presentation & Communication",
    ];
};

const metricMapping: Record<string, string> = {
    metric1: "Originality & Creativity",
    metric2: "Technical Implementation",
    metric3: "User Experience (UX)",
    metric4: "Problem-Solving",
    metric5: "Presentation & Communication",
};

const mapGrades = (teamData: GradesData): Record<string, number> => {
    return Object.entries(teamData.grades).reduce((acc, [key, value]) => {
        const metricName = metricMapping[key];
        if (metricName) {
            acc[metricName] = Number(value.N);
        }
        return acc;
    }, {} as Record<string, number>);
};

const defaultScoring = fetchMetrics().reduce((acc, metric, index) => {
    acc[metric] = { N: "0" };
    return acc;
}, {} as Record<string, { N: string }>);

export {
    fetchRubricContents,
    fetchMetrics,
    defaultScoring,
    metricMapping,
    mapGrades,
};
export type { ScoringMetric, GradesData };
