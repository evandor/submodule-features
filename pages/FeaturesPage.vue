<template>

  <!-- toolbar -->
  <q-toolbar class="text-primary">
    <div class="row fit">
      <div class="col-12">
        <q-toolbar-title>
          <div class="row justify-start items-baseline">
            <div class="col-1">
              <q-icon name="chevron_left" class="cursor-pointer q-mr-lg" size="24px"
                      @click="router.push('/mainpanel/settings')">
                <q-tooltip>Back</q-tooltip>
              </q-icon>
            </div>
            <div class="col-9">{{ title }}</div>
            <div class="col text-right">
              <OpenRightDrawerWidget/>
            </div>
          </div>
        </q-toolbar-title>
      </div>
    </div>
  </q-toolbar>

  <div class="row fit greyBorderTop"></div>

  <InfoMessageWidget
    :probability="1"
    ident="featuresPage_overview"
    hint="The Tabsets Extension starts simple - you can manage tabs - but it has more to offer. Check out the optional or
      experimental features described below. Some of the features may require additional browser permissions which you will have to grant."/>

  <div class="row q-ma-lg">

    <div class="col-7">
      <div class="text-h6">{{ appFeature?.name }}</div>
      <div>
        Status: {{ featureActive ? 'active' : 'inactive' }}
        <span v-if="needsAccountAndUserNotLoggedIn()" class="text-warning"> - You need a (free) account to use this feature</span>
      </div>
    </div>

    <div class="col text-right q-mr-xl">
      <div>
        <q-btn v-if="!hasFeature()" color="warning"
               label="Activate Feature" @click="grant(feature)" :disable="needsAccountAndUserNotLoggedIn()"/>
        <q-btn v-else
               label="Deactivate Feature" @click="revoke(feature)"/>
      </div>
    </div>

    <div class="col-12 q-my-lg" v-if="needsAccountAndUserNotLoggedIn()">
      Click on the login icon in the sidepanel to sign up for an account:<br><br>
      <q-img src="signup.png" width="100px"/>
    </div>

    <div class="col-12 q-my-sm">
      <div class="text-subtitle2">Type</div>
    </div>

    <div class="col-12 q-my-md">
      <div v-if="appFeature?.type === FeatureType.RECOMMENDED">
        This feature is considered stable and useful, but not activated by default. To use it, switch this feature on.
      </div>
      <div v-if="appFeature?.type === FeatureType.OPTIONAL">
        This feature is considered stable but might not be useful for everybody. To use it, switch this feature on.
      </div>
      <div v-if="appFeature?.type === FeatureType.EXPERIMENTAL">
        This feature is not considered stable and might break other parts of this extension. To use it at your
        own risk, switch this feature on.
      </div>
    </div>

    <div class="col-12 q-my-sm">
      <div class="text-subtitle2">Description</div>
    </div>

    <div class="col-12 q-my-md">
      <div v-html="appFeature?.description"></div>
      <div v-if="hasFeature()" class="text-primary q-mt-md"> Feature is enabled </div>
    </div>

    <div class="col-12 q-my-sm" v-if="getDependentFeatures(feature).length > 0 && !hasFeature()">
      <div class="text-subtitle2">Dependent Features</div>
    </div>
    <div class="col-12 q-my-sm" v-if="getDependentFeatures(feature, true).length > 0 && hasFeature()">
      <div class="text-subtitle2">Dependent Features</div>
    </div>

    <div class="col-12 q-my-md" v-if="getDependentFeatures(feature).length > 0 && !hasFeature()">
      Activating this feature will make {{ getDependentFeatures(feature).length }} more feature(s) available:
      <ul>
        <li v-for="f in getDependentFeatures(feature)">{{ f.name }}</li>
      </ul>
    </div>

    <div class="col-12 q-my-md" v-if="getDependentFeatures(feature, true).length > 0 && hasFeature()">
      Deactivating this feature would deactivate {{ getDependentFeatures(feature, true).length }} more feature(s):
      <ul>
        <li v-for="f in getDependentFeatures(feature, true)">{{ f.name }} (currently active)</li>
      </ul>
    </div>

    <div class="col-12 q-my-md" v-if="appFeature?.image">
      <div>
        <q-img :src="appFeature?.image" :width="appFeature?.imageWidth || '250px'"/>
      </div>
    </div>

    <!--    <template v-if="appFeature?.more">-->
    <!--      <div class="col-12 q-my-sm">-->
    <!--        <div class="text-subtitle2">More Info</div>-->
    <!--      </div>-->

    <!--      <div class="col-12 q-my-md">-->
    <!--        <div> click <a class="cursor-pointer text-blue-6"-->
    <!--                       @click="NavigationService.openOrCreateTab([appFeature?.more])">here</a></div>-->
    <!--      </div>-->
    <!--    </template>-->

<!--    <div class="col-12 q-my-sm">-->
<!--      <div class="text-subtitle2">Permissions</div>-->
<!--    </div>-->

<!--    <div class="col-12 q-my-md">-->
<!--      <div> {{ permissionText(appFeature) }}</div>-->
<!--    </div>-->

  </div>

</template>

<script setup lang="ts">
import {onMounted, ref, watchEffect} from 'vue'
import {useRoute, useRouter} from "vue-router";
import {Notify} from "quasar";
import {useCommandExecutor} from "src/core/services/CommandExecutor";
import InfoMessageWidget from "src/ui/widgets/InfoMessageWidget.vue";
import {DrawerTabs, useUiStore} from "src/ui/stores/uiStore";
import OpenRightDrawerWidget from "src/ui/widgets/OpenRightDrawerWidget.vue";
import Analytics from "src/core/utils/google-analytics";
import Command from "src/core/domain/Command";
import {useUtils} from "src/core/services/Utils";
import {useAuthStore} from "src/stores/authStore";
import {Feature} from "src/features/models/Feature";
import {useFeaturesStore} from "src/features/stores/featuresStore";
import {FeatureIdent, FeatureType} from "src/app/models/FeatureIdent";
import {AppFeatures} from "src/app/models/AppFeatures";

const route = useRoute();
const router = useRouter();

const title = ref('')
const {sendMsg} = useUtils()

useUiStore().rightDrawerSetActiveTab(DrawerTabs.FEATURES)

const feature = ref(null as unknown as string)
const appFeature = ref<Feature | undefined>(undefined)
const featureActive = ref(false)

onMounted(() => {
  Analytics.firePageViewEvent('FeaturesPage', document.location.href);
})

watchEffect(() => {
    feature.value = route.params.feature as string
    const f = feature.value?.toUpperCase() as FeatureIdent
    if (f) {
      appFeature.value = new AppFeatures().getFeature(f)
      console.log("got app feature", appFeature.value)
      if (appFeature.value) {
        featureActive.value = useFeaturesStore().hasFeature(appFeature.value.ident as FeatureIdent)
        switch (appFeature.value.type) {
          case FeatureType.EXPERIMENTAL:
            title.value = "Experimental Feature"
            break;
          case FeatureType.RECOMMENDED:
            title.value = "Recommended Feature"
            break;
          case FeatureType.OPTIONAL:
            title.value = "Optional Feature"
            break;
          case FeatureType.PLANNED:
            title.value = "Planned Feature"
            break;
        }
      }
    }
  }
)

const hasFeature = () => {
  if (appFeature.value && appFeature.value.ident) {
    const ident: FeatureIdent = FeatureIdent[appFeature.value.ident as keyof typeof FeatureIdent]
    return useFeaturesStore().hasFeature(ident)
  }
  return false;
}

const grant = (ident: string) => {
  if (appFeature.value) {
    try {
      appFeature.value.activateCommands.forEach((c: Command<any>) => {
        useCommandExecutor().execute(c)
      })
      if (ident === 'bookmarks') {
        sendMsg('reload-application')
      }
    } catch (err: any) {
      Notify.create({
        color: 'negative',
        message: "got error: " + err.toString()
      })
    }
  }
  //TODO the default activeCommand always executes "permissionStore.activateFeature" - so we do it twice
  /* if (appFeature.value && appFeature.value.activateCommand) {
     useCommandExecutor().execute(appFeature.value.activateCommand)
         .then((executionResult: ExecutionResult<any>) => {
           if (executionResult.result) {
             permissionsStore.activateFeature(ident)
           }
         })
   } else {
     permissionsStore.activateFeature(ident)
   }
 */
}

const revoke = (ident: string) => {
  if (appFeature.value && appFeature.value.deactivateCommands) {
    console.log("revoking1", ident, appFeature.value.deactivateCommands)
    // TODO multiple commands?
    useCommandExecutor().execute(appFeature.value.deactivateCommands[0]!)
      .then(() => useFeaturesStore().deactivateFeature(ident))
  } else {
    console.log("revoking2", ident)
    useFeaturesStore().deactivateFeature(ident)
  }
}

const getDependentFeatures = (rootFeature: string, onlyActive: boolean = false): Feature[] => {
  const featureIdent = rootFeature.toUpperCase() as FeatureIdent
  const dependentFeatures: Feature[] = []
  new AppFeatures().getFeatures().forEach(appFeature => {
    if (appFeature.requires.findIndex((requirementAsString: string) => {
      const r: FeatureIdent = FeatureIdent[requirementAsString as keyof typeof FeatureIdent]
      return r === featureIdent && (onlyActive ? isActive(appFeature) : true)
    }) >= 0) {
      dependentFeatures.push(appFeature)
    }
  })
  return dependentFeatures
}

const isActive = (f: Feature) => useFeaturesStore().hasFeature(FeatureIdent[f.ident as keyof typeof FeatureIdent])

const needsAccountAndUserNotLoggedIn = (): boolean => {
  if (!appFeature.value?.needsAccount) {
    return false
  }
  return !useAuthStore().isAuthenticated
}

</script>

