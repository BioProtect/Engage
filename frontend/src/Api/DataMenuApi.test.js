import { afterEach, describe, expect, it, vi } from 'vitest'
import { get_pad_activities, save_activity } from './DataMenuApi'

function mockFetch(status, body) {
  const fetch = vi.fn().mockResolvedValue({
    ok: status < 400,
    json: () => Promise.resolve(body),
  })
  vi.stubGlobal('fetch', fetch)
  return fetch
}

afterEach(() => vi.unstubAllGlobals())

describe('get_pad_activities', () => {
  it('parses the JSON string the server sends in `data`', async () => {
    const rows = [
      { id: 1, category: 'Fishing', activity: 'Traps' },
    ]
    const fetch = mockFetch(200, {
      data: JSON.stringify(rows),
    })

    await expect(get_pad_activities()).resolves.toEqual(rows)
    expect(fetch.mock.calls[0][0]).toMatch(/\/getActivities$/)
    expect(fetch.mock.calls[0][1].method).toBe('GET')
  })

  it('throws the server error message on a failed response', async () => {
    mockFetch(500, { error: 'PAD table missing' })
    await expect(get_pad_activities()).rejects.toThrow('PAD table missing')
  })
})

describe('save_activity', () => {
  it('pOSTs JSON with the bearer token', async () => {
    const fetch = mockFetch(200, {})
    await save_activity({ name: 'Traps', geometry: {}, token: 'abc' })

    const [url, init] = fetch.mock.calls[0]
    expect(url).toMatch(/\/engage\?action=create-activity$/)
    expect(init.method).toBe('POST')
    expect(init.headers.Authorization).toBe('Bearer abc')
    expect(JSON.parse(init.body).name).toBe('Traps')
  })
})
