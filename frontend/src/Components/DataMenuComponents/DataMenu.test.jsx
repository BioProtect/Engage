import { screen, waitForElementToBeRemoved, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { get_pad_activities } from '../../Api/DataMenuApi'
import { renderWithProviders } from '../../test/renderWithProviders'
import DataMenu from './DataMenu'

vi.mock('../../Api/DataMenuApi', async importOriginal => ({
  ...(await importOriginal()),
  get_pad_activities: vi.fn(),
}))

const PAD = [
  { id: 101, category: 'Fishing', activity: 'Traps' },
  { id: 102, category: 'Fishing', activity: 'Demersal trawling' },
  { id: 201, category: 'Aquaculture', activity: 'Finfish aquaculture' },
]

beforeEach(() => {
  get_pad_activities.mockReset()
  get_pad_activities.mockResolvedValue(PAD)
})

async function openActivitiesTab(user) {
  await user.click(screen.getByRole('tab', { name: /Activities/ }))
}

async function pick(user, name) {
  await user.click(screen.getByRole('button', { name: 'Add activity' }))
  const dialog = await screen.findByRole('dialog')
  await user.click(await within(dialog).findByText(name))
  // MUI keeps the rest of the page aria-hidden until the dialog has gone.
  await waitForElementToBeRemoved(dialog)
}

describe('dataMenu activities', () => {
  it('starts with no activities and offers an Add button', async () => {
    const { user } = renderWithProviders(<DataMenu />)
    await openActivitiesTab(user)

    expect(screen.getByText('No activities yet')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Add activity' })).toHaveLength(2)
  })

  it('lists PAD activities by category and filters by search', async () => {
    const { user } = renderWithProviders(<DataMenu />)
    await user.click(screen.getByRole('button', { name: 'Add activity' }))
    const dialog = await screen.findByRole('dialog')

    expect(await within(dialog).findByText('Traps')).toBeInTheDocument()
    expect(within(dialog).getByText('Aquaculture')).toBeInTheDocument()

    await user.type(within(dialog).getByPlaceholderText('Search activities'), 'trawl')
    expect(within(dialog).getByText('Demersal trawling')).toBeInTheDocument()
    expect(within(dialog).queryByText('Traps')).not.toBeInTheDocument()
    expect(get_pad_activities).toHaveBeenCalledTimes(1)
  })

  it('picking an activity adds its row and starts drawing; Stop ends it', async () => {
    const { user } = renderWithProviders(<DataMenu />)
    await pick(user, 'Traps')

    // While drawing the sheet drops to the bar: the bar names the activity
    // and the list (tabs included) is hidden.
    expect(screen.getByText('Drawing')).toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: /Activities/ })).not.toBeInTheDocument()

    // Stop brings the sheet back, on the Activities tab with the new row.
    await user.click(screen.getByRole('button', { name: 'Stop drawing Traps' }))
    expect(screen.getByText('BioProtect Engage')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Activities/ })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('button', { name: 'More actions for Traps' })).toBeInTheDocument()
  })

  it('picking an already listed activity does not add it twice', async () => {
    const { user } = renderWithProviders(<DataMenu />)
    await pick(user, 'Traps')
    await user.click(screen.getByRole('button', { name: 'Stop drawing Traps' }))
    await pick(user, 'Traps')
    await user.click(screen.getByRole('button', { name: 'Stop drawing Traps' }))

    expect(screen.getAllByRole('button', { name: /^More actions for Traps$/ })).toHaveLength(1)
  })

  it('shows a retry when PAD cannot be loaded', async () => {
    get_pad_activities.mockRejectedValueOnce(new Error('down'))
    const { user } = renderWithProviders(<DataMenu />)
    await user.click(screen.getByRole('button', { name: 'Add activity' }))
    const dialog = await screen.findByRole('dialog')

    expect(await within(dialog).findByText('Couldn\'t load activities')).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Retry' }))
    expect(await within(dialog).findByText('Traps')).toBeInTheDocument()
  })

  it('cannot add activities when signed out', () => {
    renderWithProviders(<DataMenu />, { signedIn: false })
    expect(screen.getByRole('button', { name: 'Add activity' })).toBeDisabled()
  })
})
