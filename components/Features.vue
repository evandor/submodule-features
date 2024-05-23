<template>

  <div class="q-ma-md">
    <b>Recommended Features</b>
  </div>

  <q-list>
    <q-item
      v-for="f in featuresByType(FeatureType.RECOMMENDED)"
      clickable v-ripple :dense="useFeaturesStore().hasFeature(FeatureIdent.DEV_MODE)"
      :active="f === selected2"
      :disable="wrongMode(f)"
      @click="showFeature2(f)">

      <q-item-section avatar>
        <q-icon :name="f.icon" size="1.3em" :color="iconColor2(f)"/>
      </q-item-section>
      <q-item-section>{{ f.name }}</q-item-section>
      <q-tooltip class="tooltip" v-if="wrongMode(f)">
        This feature is not available in this mode of tabsets
      </q-tooltip>
    </q-item>

  </q-list>

  <div class="q-ma-md">
    <b>Optional Features</b>
  </div>

  <q-list>
    <q-item
      v-for="f in featuresByType(FeatureType.OPTIONAL)"
      clickable v-ripple :dense="useFeaturesStore().hasFeature(FeatureIdent.DEV_MODE)"
      :active="f === selected2"
      :disable="wrongMode(f)"
      @click="showFeature2(f)">

      <q-item-section avatar>
        <q-icon :name="f.icon" size="1.3em" :color="iconColor2(f)"/>
      </q-item-section>
      <q-item-section>{{ f.name }}</q-item-section>
      <q-tooltip class="tooltip" v-if="wrongMode(f)">
        This feature is not available in this mode of tabsets
      </q-tooltip>
    </q-item>
  </q-list>

  <div class="q-ma-md" v-if="useFeaturesStore().hasFeature(FeatureIdent.DEV_MODE)">
    <b>Experimental Features</b>
  </div>

  <q-list v-if="useFeaturesStore().hasFeature(FeatureIdent.DEV_MODE)">
    <q-item
      v-for="f in featuresByType(FeatureType.EXPERIMENTAL)"
      clickable v-ripple :dense="useFeaturesStore().hasFeature(FeatureIdent.DEV_MODE)"
      :active="f === selected2"
      :disable="wrongMode(f)"
      @click="showFeature2(f)">

      <q-item-section avatar>
        <q-icon :name="f.icon" size="1.3em" :color="iconColor2(f)"/>
      </q-item-section>
      <q-item-section>{{ f.name }}</q-item-section>
      <q-tooltip class="tooltip" v-if="wrongMode(f)">
        This feature is not available in this mode of tabsets
      </q-tooltip>
    </q-item>
  </q-list>


</template>

<script setup lang="ts">

import {ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import _ from "lodash"
import {useQuasar} from "quasar";
import {Feature} from "src/features/models/Feature";
import {useFeaturesStore} from "src/features/stores/featuresStore";
import {FeatureIdent, FeatureType} from "src/models/FeatureIdent";
import {AppFeatures} from "src/models/AppFeatures";

const router = useRouter()
const route = useRoute()
const selected2 = ref<Feature | undefined>(undefined)

const features = ref(new AppFeatures().features)

const featuresByType = (type: FeatureType) =>
  _.filter(features.value, (f: Feature) => {
    const typeAndModeMatch = f.type === type && !wrongMode(f)
    if (f.requires.length > 0) {
      let missingRequirement = false
      f.requires.forEach((requirement: string) => {
        // if (!useFeaturesStore().hasFeature(requirement)) {
        if (useFeaturesStore().activeFeatures.indexOf(requirement.toLowerCase()) === -1) {
          missingRequirement = true
        }
      })
      if (missingRequirement) {
        return false
      }
    }
    return typeAndModeMatch
  })

//@ts-ignore
const appVersion = import.meta.env.PACKAGE_VERSION

const iconColor2 = (f: Feature) => {
  return useFeaturesStore().activeFeatures.indexOf(f.ident.toLowerCase()) >= 0 ? 'green' : 'grey'
}

const showFeature2 = (f: Feature) => {
  selected2.value = f
  route.path.startsWith('/mainpanel/') ?
    router.push("/mainpanel/features/" + f.ident.toLowerCase()) :
    router.push("/features/" + f.ident.toLowerCase())
}

const wrongMode = (f: Feature) => {
  if (f.useIn.indexOf('chrome_bex') >= 0) {
    if (useQuasar().platform.is.chrome) {
      return false
    }
  }
  return f.useIn?.indexOf('all') < 0 && f.useIn?.indexOf(process.env.MODE || '') < 0
}
</script>
