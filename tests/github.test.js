import { describe, it, expect, beforeEach } from 'vitest';
import { buildGitHubPayload, parseGitHubResponse } from '../src/github.js';

const sampleData = {
  cycle: { currentSession: 1, genkiLesson: 1, genkiPoint: 1, lastUpdated: null },
  log: [],
};

function toBase64(data) {
  const json = JSON.stringify(data, null, 2);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

describe('buildGitHubPayload', () => {
  it('content decodes back to original data', () => {
    const payload = buildGitHubPayload(sampleData, null);
    const decoded = JSON.parse(atob(payload.content));
    expect(decoded).toEqual(sampleData);
  });
  it('includes sha when provided', () => {
    const payload = buildGitHubPayload(sampleData, 'abc123');
    expect(payload.sha).toBe('abc123');
  });
  it('omits sha when null', () => {
    const payload = buildGitHubPayload(sampleData, null);
    expect(payload.sha).toBeUndefined();
  });
  it('has non-empty default message', () => {
    const payload = buildGitHubPayload(sampleData, null);
    expect(payload.message.length).toBeGreaterThan(0);
  });
  it('uses custom message when provided', () => {
    const payload = buildGitHubPayload(sampleData, null, { message: 'test msg' });
    expect(payload.message).toBe('test msg');
  });
  it('defaults to master branch', () => {
    const payload = buildGitHubPayload(sampleData, null);
    expect(payload.branch).toBe('master');
  });
  it('uses custom branch when provided', () => {
    const payload = buildGitHubPayload(sampleData, null, { branch: 'main' });
    expect(payload.branch).toBe('main');
  });
});

describe('parseGitHubResponse', () => {
  it('parses valid response', () => {
    const response = { content: toBase64(sampleData), sha: 'def456', encoding: 'base64' };
    const result = parseGitHubResponse(response);
    expect(result.data).toEqual(sampleData);
    expect(result.sha).toBe('def456');
  });
  it('returns null for null input', () => {
    expect(parseGitHubResponse(null)).toBeNull();
  });
  it('returns null when content missing', () => {
    expect(parseGitHubResponse({ sha: 'abc' })).toBeNull();
  });
  it('returns null for non-base64 encoding', () => {
    expect(parseGitHubResponse({ content: 'x', encoding: 'utf-8' })).toBeNull();
  });
  it('accepts omitted encoding field (GitHub default is base64)', () => {
    const response = { content: toBase64(sampleData), sha: 'xyz' };
    const result = parseGitHubResponse(response);
    expect(result).not.toBeNull();
  });
});
