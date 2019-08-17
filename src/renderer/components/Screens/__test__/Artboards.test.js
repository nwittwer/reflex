import {
  mount,
  createLocalVue
} from '@vue/test-utils'
import store from '@/store'
import ComponentWithVuex from '@/components/Screens/Artboards.vue'

const localVue = createLocalVue()
const appName = 'Reflex'

describe('empty state', () => {
  const wrapper = mount(ComponentWithVuex, {
    store,
    localVue
  })

  test('should display welcome message', () => {
    expect(wrapper.html()).toContain(`Welcome to ${appName}`)
  })

  test('should inform how to add screen sizes', () => {
    expect(wrapper.html()).toContain('You can create new screens in the Screens panel on the left.')
  })
})
