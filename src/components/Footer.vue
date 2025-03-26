<template>
  <v-footer padless>
    <v-card class="flex" flat tile color="#f5f5f5">
      <v-card-text class="text-center">
        {{ new Date().getFullYear() }} — <strong><a href="https://www.cefriel.com">Cefriel</a></strong> - Powered by <strong><a href="https://kcong.cefriel.com/">KCONG</a></strong>     
      </v-card-text>
    </v-card>
  </v-footer>
</template>

<script>
export default {
  name: 'Footer',
}
</script>
