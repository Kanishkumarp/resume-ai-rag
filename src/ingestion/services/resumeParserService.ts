import { ResumeParseResult } from '../types';
import { cleanResumeText } from '../utils/textCleaner';
import { COMPANY_NAMES, DEGREE_REGEX, EMAIL_REGEX, EXPERIENCE_REGEX, LOCATION_REGEX, PHONE_REGEX, SKILL_NAMES } from '../utils/regexUtils';

export class ResumeParserService {
  parseResume(rawText: string): ResumeParseResult {
    const cleaned = cleanResumeText(rawText);
    const lines = cleaned.split(/\n+/).map((line) => line.trim()).filter(Boolean);
    const fallbackLines = this.extractLines(rawText);
    const effectiveLines = fallbackLines.length > 0 ? fallbackLines : lines;

    const name = this.extractName(effectiveLines);
    const email = this.extractEmail(cleaned);
    const phone = this.extractPhone(cleaned);
    const location = this.extractLocation(cleaned);
    const company = this.extractCompany(cleaned, effectiveLines);
    const role = this.extractRole(effectiveLines);
    const education = this.extractEducation(cleaned, effectiveLines);
    const skills = this.extractSkills(cleaned);
    const totalExperience = this.extractExperience(cleaned);

    return {
      name,
      email,
      phone,
      location,
      skills,
      company,
      role,
      education,
      totalExperience,
    };
  }

  private extractLines(rawText: string): string[] {
    return rawText
      .replace(/\r/g, '\n')
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  private extractName(lines: string[]): string {
    return lines[0] ?? '';
  }

  private extractEmail(text: string): string {
    const match = EMAIL_REGEX.exec(text);
    return match?.[0] ?? '';
  }

  private extractPhone(text: string): string {
    const match = PHONE_REGEX.exec(text);
    return match?.[0] ?? '';
  }

  private extractLocation(text: string): string {
    const match = LOCATION_REGEX.exec(text);
    return match?.[1] ?? '';
  }

  private extractCompany(text: string, lines: string[]): string {
    for (const company of COMPANY_NAMES) {
      if (text.toLowerCase().includes(company.toLowerCase())) {
        return company;
      }
    }

    return lines.find((line) => line.length > 2 && !line.includes('@') && !line.includes('http')) ?? '';
  }

  private extractRole(lines: string[]): string {
    return lines[1] ?? '';
  }

  private extractEducation(text: string, lines: string[]): string {
    const lineMatch = lines.find((line) => DEGREE_REGEX.test(line));
    if (lineMatch) {
      return lineMatch;
    }

    const match = DEGREE_REGEX.exec(text);
    return match?.[0] ?? '';
  }

  private extractSkills(text: string): string[] {
    return SKILL_NAMES.filter((skill) => text.toLowerCase().includes(skill.toLowerCase()));
  }

  private extractExperience(text: string): number | undefined {
    const match = EXPERIENCE_REGEX.exec(text);
    if (!match) {
      return undefined;
    }

    return Number(match[1]);
  }
}
