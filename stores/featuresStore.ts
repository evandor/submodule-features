import {defineStore} from "pinia";
import {useUtils} from "src/services/Utils";
import {ref} from "vue";
import {Window} from "src/windows/models/Window";
import PersistenceService from "src/services/PersistenceService";
import FeaturesPersistence from "src/features/persistence/FeaturesPersistence";
import {LocalStorage} from "quasar";

export const useFeaturesStore = defineStore('features', () => {

  let storage = null as unknown as FeaturesPersistence

  // related to browser permissions
  const grantedOptionalPermissions = ref<string[] | undefined>([])
  const grantedOptionalOrigins = ref<string[] | undefined>([])
  const permissions = ref<chrome.permissions.Permissions | undefined>(undefined)

  // related to tabsets permissions
  const activeFeatures = ref<string[]>(LocalStorage.getItem('ui.activeFeatures') as string[] || [])

  async function initialize(ps: FeaturesPersistence) {
    console.debug(" ...initializing features store")
    storage = ps
    await storage.init()
    await load()
  }

  async function load() {
    activeFeatures.value = await storage.getActiveFeatures()
    // if (process.env.MODE !== 'bex') {
    //   return
    // }
    if (chrome) { // issues in vitest where chrome is not defined
      // @ts-ignore
      permissions.value = await chrome.permissions.getAll()
      if (permissions.value) {
        grantedOptionalPermissions.value = permissions.value.permissions ? permissions.value.permissions : []
        grantedOptionalOrigins.value = permissions.value.origins ? permissions.value.origins : []
      }
    }
  }
  return {
    initialize,
  }
})

