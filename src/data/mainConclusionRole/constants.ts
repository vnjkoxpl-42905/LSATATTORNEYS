export const MCR_OPINION_INDICATORS: Record<string, string> = {
  'Obviously': 'Obviously, the company is failing.',
  'Should': 'We should invest in solar energy.',
  'Probably': 'It will probably rain tomorrow.',
  'Evidently': 'Evidently, the plan was flawed.',
  'Ought': 'The government ought to act.'
};

export const MCR_READING_SEQUENCE = [
  { num: 1, text: "Ask whether it is an argument: Not every stimulus is an argument. If there is no claim being supported, it may just be a set of facts. If there is a claim supported by evidence, it is an argument." },
  { num: 2, text: "Find the conclusion: Ask: what is the author trying to prove? That is the conclusion." },
  { num: 3, text: "Find the premises: Ask: what evidence is being used to support that conclusion? Those are the premises." },
  { num: 4, text: "Analyze the gap: Ask: do these premises really justify that conclusion? That is where most LR questions live.", highlight: true },
];
