<template>
  <div>
    <v-row class="px-10 my-2">
      <v-col cols="8" class="py-2">
        <p><b>Fill the form to obtain a procedure compliant with the <a href="https://w3id.org/pko">PKO ontology</a></b>.
          This page is powered by <a
          href="https://kcong.cefriel.com/">KCONG</a> (Knowledge Catalogue and Governance) a complete (meta)data catalogue
          solution developed by <a href="https://www.cefriel.com/">Cefriel</a> and customised for the <a href="https://perks-project.eu/">PERKS</a> project.
        </p>
        <p>You can use the buttons below to <i>Download</i> the content of the form, or to <i>Upload</i> the content of a form previously downloaded.</p>
        <v-row>
          <v-btn @click="initForm" class="ml-2 mt-2 mr-4">
            <v-icon left>mdi-upload</v-icon>
            Upload
          </v-btn>
          <input ref="formInput" type="file" accept="application/json" style="display:none" @change="onUploadedForm">
          <v-btn @click="downloadForm" class="mt-2">
            <v-icon left>mdi-download</v-icon>
            Download
          </v-btn>
        </v-row>
      </v-col>
    </v-row>

    <Alert v-for="(alert_message, index) in alert_messages" :key="index" :message="alert_message.message"
           :alert_type="alert_message.alert_type"/>
    <v-container>
      <v-row>
        <v-col cols="6">
          <v-form ref="form" v-model="valid">
            <JsonForm :key="formKey" :value="asset" v-on:update:model="set_asset_value"
                      v-bind:schema="asset_schema" v-bind:options="options"/>
          </v-form>
          <p><br></p>
          <v-btn @click="create_object" style="margin-top: 10px;">Generate</v-btn>
        </v-col>

        <v-col cols="6">
          <div v-if="saved_asset_rdf" class="rdf-container">
            <!-- Dropdown to select format -->
            <v-select
                v-model="selectedFormat"
                :items="formats"
                label="Select RDF Format"
                class="mb-3"
            ></v-select>

            <rdf-editor
                class="h-full overflow-hidden"
                :value.prop="saved_asset_rdf"
                :format="selectedFormat"
                :readonly=true
                :prefixes="editorPrefixes"
                auto-parse
                parse-delay="1000"
                @parsing-failed="onParsingFailed"
                @prefixes-parsed="onPrefixesParsed"
                @serialized="onSerialized"
            ></rdf-editor>

            <v-btn color="primary" @click="downloadRDF" class="mb-2">Download RDF</v-btn>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import JsonForm from './JsonForm';
import Alert from './Alert.vue';

import Ajv from "ajv";
const ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}

import form_template from 'raw-loader!@/assets/form-lifting.jinja';
import '@rdfjs-elements/rdf-editor';
import { parsers } from '@rdf-esm/formats-common'; // Updated
import { v4 as uuidv4 } from 'uuid';


export default {
  name: 'AssetCreate',
  components: {
    JsonForm,
    Alert
  },
  props: ['asset_type'],
  data() {
    return {
      template_engine: null,
      template: null,
      valid: null,
      asset_schema: {},
      initial_asset: {},
      asset: {},
      saved_asset: {},
      saved_asset_rdf: null,
      serialized_rdf: null,
      alert_messages: [],
      selectedPdf: null,
      pdfUrl: null,
      formKey: 0,
      parseError: null,
      formats: [...parsers.keys()],
      selectedFormat: 'text/turtle', // Default format
      editorPrefixes: null,
      options: {
        ajv: ajv,
        context: {
          languages: require("../assets/languages.json")
        }
      }
    };
  },
  mounted() {
    this.asset_schema = require("@/assets/form.json");
    this.template_engine = require('nunjucks');
    this.template = this.template_engine.compile(form_template);
  },
  methods: {
    onParsingFailed(e) {
      console.error('Parsing failed:', e.detail.error);
      this.parseError = e.detail.error;
    },
    onPrefixesParsed(e) {
      // Supported prefixes at https://github.com/zazuko/rdf-vocabularies/tree/master/ontologies
      if (!this.editorPrefixes) {
        this.editorPrefixes = Object.keys(e.detail.prefixes).join(",");
      }
    },
    onSerialized(e) {
      this.serialized_rdf = e.detail.value;
    },
    downloadRDF() {
      if (!this.serialized_rdf) {
        this.alert_messages.push({message: 'No RDF content to download.', alert_type: 'error'});
        return;
      }

      const formatToExtension = {
        'text/turtle': 'ttl',
        'application/ld+json': 'jsonld',
        'application/rdf+xml': 'rdf',
        'application/trig': 'trig',
        'application/n-triples': 'nt',
        'application/n-quads': 'nq',
        'text/n3': 'n3',
      };

      const fileExtension = formatToExtension[this.selectedFormat] || 'ttl';

      const blob = new Blob([this.serialized_rdf], {type: this.selectedFormat});
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rdf-data.${fileExtension}`);
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    initForm() {
      this.$refs.formInput.click();
    },
    downloadForm() {
      const jsonString = JSON.stringify(this.asset, null, 2); 

      const blob = new Blob([jsonString], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `procedure-export.json`);
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    setJsonForm(jsonObject) {
      if (typeof jsonObject !== 'object') {
        throw new Error('The response is not a valid JSON object');
      }
      const validate = ajv.compile(this.asset_schema);
      const valid = validate(jsonObject);

      if (valid) {
        this.asset = {...jsonObject};
        this.formKey = Date.now();
      } else {
        const errors = validate.errors.map(err => `${err.instancePath} ${err.message}`).join(', ');
        throw new Error(`Schema validation failed: ${errors}`);
      }
    },
    onUploadedForm(event) {
      const file = event.target.files[0];
      if (file && file.type === "application/json") {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const jsonContent = JSON.parse(e.target.result);
            this.setJsonForm(jsonContent);
            this.alert_messages = [];
            this.alert_messages.push({message: 'Form data filled successfully', alert_type: 'success'});
          } catch (error) {
            console.error("Invalid JSON file:", error);
            alert("Invalid JSON file format.");
          }
        };
        reader.readAsText(file);
      } else {
        this.alert_messages.push({message: 'Please select a valid JSON file.', alert_type: 'error'});
      }
    },
    set_asset_value(event) {
      this.asset = event;
    },
    create_object() {
      this.$refs.form.validate();
      if (!this.valid) {
        this.alert_messages.push({message: 'Validation error', alert_type: 'error'});
      } else {
        this.alert_messages = [];
      }

      if (!this.asset.header) {
        this.asset.header = {};
      }
      this.asset.header.creation_time = new Date().toISOString();
      this.asset.header.last_updated = new Date().toISOString();
      this.asset.header.type = this.asset_type;
      this.asset.header.id = uuidv4();

      function slugify(str) {
        return String(str).normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
      }

      try {
        this.saved_asset_rdf = this.template.render({
          obj: this.asset,
          data_platform_url: "https://kcong.cefriel.com/",
          slugify: slugify
        });
      } catch (error) {
        console.log(error);
      }
      this.saved_asset_rdf = this.saved_asset_rdf.replace(/^\s*\n/gm, "");
    }
  }
};
</script>
