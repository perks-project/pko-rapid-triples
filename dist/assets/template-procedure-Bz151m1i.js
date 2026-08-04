var e=`{%- set prefix="https://perks-project.eu/data/" -%}\r
{%- set procedure_iri = '<' + prefix + slugify(obj.title) + '>' -%}\r
{%- set user_iri = '<' + prefix + 'user/' + slugify(obj.user) + '>' -%}\r
\r
@prefix dcterms: <http://purl.org/dc/terms/> .\r
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\r
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\r
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\r
@prefix owl: <http://www.w3.org/2002/07/owl#> .\r
@prefix dcat: <http://www.w3.org/ns/dcat#> .\r
@prefix vcard: <http://www.w3.org/2006/vcard/> .\r
@prefix foaf: <http://xmlns.com/foaf/0.1/> .\r
@prefix schema: <https://schema.org/> .\r
@prefix prov: <http://www.w3.org/ns/prov#> .\r
@prefix pro: <http://purl.org/spar/pro/> .\r
@prefix time: <http://www.w3.org/2006/time#> .\r
@prefix adms: <http://www.w3.org/ns/adms#> .\r
@prefix m4ing: <http://w3id.org/nfdi4ing/metadata4ing#> .\r
@prefix pplan: <http://purl.org/net/p-plan#> .\r
@prefix onlim: <https://vocab.sti2.at/ds/> .\r
@prefix pko: <https://w3id.org/pko#> .\r
@prefix pkdata: <{{prefix}}> .\r
@prefix pko-ind: <https://w3id.org/pko/industry#> .\r
\r
{# MACRO RENDER REFERENCES #}\r
{% macro renderReferences(references) %}\r
  {% for ref in references %}\r
  {% if ref.resource %}\r
  dcterms:references [\r
    {% if ref.resource.title %}\r
    dcterms:title """{{ref.resource.title}}""";\r
    {% endif %}\r
    {% if ref.resource.format %}\r
    dcterms:format <http://publications.europa.eu/resource/authority/file-type/{{ref.format}}> ;\r
    {% endif %}\r
    dcat:accessURL <{{ref.resource.url}}> ;\r
    a dcat:Resource\r
  ] ;\r
  {% endif %}\r
  {% endfor %}\r
{% endmacro %}\r
\r
{# MACRO RENDER FUNCTIONS #}\r
{% macro renderFunction(function) %}\r
{%- set function_iri = '<' + prefix + 'Function/' + slugify(function) + '>' -%}\r
{{function_iri | safe}} a pko:Function ;\r
  dcterms:title "{{function}}"^^xsd:string .\r
{% endmacro %}\r
\r
{# MACRO RENDER ACTIONS #}\r
{% macro renderAction(action) %}\r
{%- set action_iri = '<' + prefix + 'Action/' + slugify(action) + '>' -%}\r
{{action_iri | safe}} a pko:Action ;\r
  dcterms:title "{{action}}"^^xsd:string .\r
{% endmacro %}\r
\r
{# MACRO RENDER INPUT/OUTPUT VARIABLES #}\r
{% macro renderVar(var) %}\r
{%- set var_iri = '<' + prefix + 'Variable/' + slugify(var) + '>' -%}\r
{{var_iri | safe}} a pplan:Variable ;\r
  dcterms:title "{{var}}"^^xsd:string .\r
{% endmacro %}\r
\r
{# MACRO RENDER REQUIRED ENTITY #}\r
{% macro renderRequiredEntityDefinition(requirement) %}\r
{%- set required_entity_iri = '<' + prefix + 'RequiredEntity/' + slugify(requirement.requiredEntity) + '>' -%}\r
{% set required_entity_type = requirement.requiredEntityType|default('')|lower %}\r
{{required_entity_iri | safe}}\r
  {% if required_entity_type == 'qualification' %}\r
  a pko:Qualification ;\r
  {% elif required_entity_type == 'role' %}\r
  a pro:Role ;\r
  {% else %}\r
  a prov:Entity ;\r
  {% endif %}\r
  dcterms:title "{{requirement.requiredEntity}}"^^xsd:string .\r
{% endmacro %}\r
\r
{# MACRO RENDER REQUIREMENT #}\r
{% macro renderRequirement(requirement) %}\r
{%- set required_entity_iri = '<' + prefix + 'RequiredEntity/' + slugify(requirement.requiredEntity) + '>' -%}\r
[ \r
  {% if requirement.title %}\r
  dcterms:title "{{requirement.title}}"^^xsd:string ;\r
  {% endif %}\r
  {% if requirement.description %}\r
  dcterms:description "{{requirement.description}}"^^xsd:string ;\r
  {% endif %}\r
  {% if requirement.type %}\r
  pko:hasRequirementType pkdata:RequirementType\\/{{requirement.type}} ;\r
  {% endif %}\r
  pko:requiredEntity {{required_entity_iri | safe}}\r
]\r
{% endmacro %}\r
\r
{# MACRO RENDER STEP - identifier and @id are pre-computed #}\r
{% macro renderStep(step) %}\r
\r
{% if step.hasReferenceProcedure %}\r
<{{step.hasReferenceProcedure | safe}}> onlim:compliesWith <https://semantify.it/ds/LqnDrczMkpxx> ;\r
a pplan:MultiStep .\r
{% else %}\r
\r
{# RENDER ALL FUNCTIONS #}\r
{% if step.requiresFunction %}\r
  {% for function in step.requiresFunction %}\r
  {{ renderFunction(function) }}\r
  {% endfor %}\r
{% endif %}\r
\r
{# RENDER ALL ACTIONS #}\r
{% if step.requiresAction %}\r
  {% for action in step.requiresAction %}\r
  {{ renderAction(action) }}\r
  {% endfor %}\r
{% endif %}\r
\r
{# RENDER ALL VARIABLES #}\r
{% if step.hasInputVar %}\r
  {% for var in step.hasInputVar %}\r
  {{ renderVar(var) }}\r
  {% endfor %}\r
{% endif %}\r
{% if step.hasOutputVar %}\r
  {% for var in step.hasOutputVar %}\r
  {{ renderVar(var) }}\r
  {% endfor %}\r
{% endif %}\r
\r
{# RENDER THE STEP #}\r
<{{step['@id'] | safe}}> \r
  {% if step.title %}\r
  dcterms:title "{{step.title}}"^^xsd:string ;\r
  {% endif %}\r
  {% if step.stepNumber %}\r
  pko:stepNumber "{{ step.stepNumber }}"^^xsd:float ;\r
  {% endif %}\r
  {% if step.description %}\r
  dcterms:description """{{step.description}}"""^^xsd:string ;\r
  {% endif %}\r
\r
{% if step.isRepeatablePolicy %}\r
  {% if step.isRepeatablePolicy.minRepetitions %} \r
  pko:minRepetitions {{step.isRepeatablePolicy.minRepetitions}} ;\r
  {% endif %}\r
  {% if step.isRepeatablePolicy.maxRepetitions %} \r
  pko:maxRepetitions {{step.isRepeatablePolicy.maxRepetitions}} ;\r
  {% endif %}\r
{% else %}\r
  {% if step.isOptional %}\r
  pko:minRepetitions 0 ;\r
  {% endif %}\r
{% endif %}\r
\r
{% if step.isStepForExpertiseLevel %}\r
  pko:isStepForExpertiseLevel pko-fagor:ExpertiseLevel\\/{{step.isStepForExpertiseLevel}} ;\r
{% endif %}\r
\r
{% if step.references %}\r
{{ renderReferences(step.references) }}\r
{% endif %}\r
\r
{% if step.requiresFunction %}\r
  {% for function in step.requiresFunction %}\r
  {%- set function_iri = '<' + prefix + 'Function/' + slugify(function) + '>' -%}\r
  pko:requiresFunction {{function_iri | safe}} ;\r
  {% endfor %}\r
{% endif %}\r
\r
{% if step.requiresAction %}\r
  {% for action in step.requiresAction %}\r
  {%- set action_iri = '<' + prefix + 'Action/' + slugify(action) + '>' -%}\r
  pko:requiresAction {{action_iri | safe}} ;\r
  {% endfor %}\r
{% endif %}\r
\r
{% if step.hasInputVar %}\r
  {% for var in step.hasInputVar %}\r
  {%- set var_iri = '<' + prefix + 'Variable/' + slugify(var) + '>' -%}\r
  pplan:hasInputVar {{var_iri | safe}} ;\r
  {% endfor %}\r
{% endif %}\r
\r
{% if step.hasOutputVar %}\r
  {% for var in step.hasOutputVar %}\r
  {%- set var_iri = '<' + prefix + 'Variable/' + slugify(var) + '>' -%}\r
  pplan:hasOutputVar {{var_iri | safe}} ;\r
  {% endfor %}\r
{% endif %}\r
\r
{% if step.hasRequirement %}\r
  {% for requirement in step.hasRequirement %}\r
  pko:hasRequirement {{ renderRequirement(requirement) }} ;\r
  {% endfor %}\r
{% endif %}\r
\r
{% if step.hasStepVerification %}\r
  {% for vf in step.hasStepVerification %}\r
  pko:hasStepVerification [\r
    a pko:StepVerification ;\r
    dcterms:title "{{vf.title}}";\r
    {% if vf.description %}\r
    dcterms:description """{{vf.description}}"""^^xsd:string ;\r
    {% endif %}\r
  ] ;\r
  {% endfor %}\r
{% endif %}\r
\r
dcterms:identifier "{{step.identifier}}"^^xsd:string .\r
\r
{% if step.hasRequirement %}\r
  {% for requirement in step.hasRequirement %}\r
  {{ renderRequiredEntityDefinition(requirement) }}\r
  {% endfor %}\r
{% endif %}\r
\r
{# Check if this is a multistep or simple step #}\r
{% if step.hasStep | length > 0 %}\r
{# Reference shape for MultiStep #}\r
<{{step['@id'] | safe}}> onlim:compliesWith <https://semantify.it/ds/LqnDrczMkpxx> ;\r
a pplan:MultiStep .\r
\r
{% if step.hasStepPolicy == 'Ordered' %}\r
{# Render ORDERED sub-steps #}\r
{% for substep in step.hasStep %}\r
  <{{step['@id'] | safe}}> pko:hasStep <{{substep['@id'] | safe}}> .\r
  {% if loop.index == 1 %}\r
    <{{step['@id'] | safe}}> pko:hasFirstStep <{{substep['@id'] | safe}}> .\r
  {% endif %}\r
  {% if loop.index > 1 %}\r
  {%- set prev_substep = step.hasStep[loop.index - 2] -%}\r
    <{{prev_substep['@id'] | safe}}> pko:nextStep <{{substep['@id'] | safe}}> .\r
  {% endif %}\r
  {{ renderStep(substep) }}\r
{% endfor %}\r
{% else %}\r
{# Render UNORDERED sub-steps #}\r
{% for substep in step.hasStep %}\r
  <{{step['@id'] | safe}}> pko:hasStep <{{substep['@id'] | safe}}> .\r
  {{ renderStep(substep) }}\r
{% endfor %}\r
{% endif %}\r
\r
{% else %}\r
{# Reference shape for simple Step #}\r
<{{step['@id'] | safe}}> onlim:compliesWith <https://semantify.it/ds/gFBlAqMqgdhR> ;\r
a pplan:Step .\r
{% endif %}\r
\r
{% endif %}\r
{% endmacro %}\r
\r
{# RENDER MAIN PROCEDURE #}\r
{{procedure_iri | safe}} a pko:Procedure ;\r
  {# Reference shape #}\r
  onlim:compliesWith <https://semantify.it/ds/fcKvHmTCPrxp> ;\r
  dcterms:title "{{obj.title}}"^^xsd:string ;\r
  {% if obj.description %}\r
  dcterms:description """{{obj.description}}"""^^xsd:string ;\r
  {% endif %}\r
  {% if obj.isAdoptedBy %}\r
  pko:isAdoptedBy pkdata:{{slugify(obj.isAdoptedBy)}} ;\r
  {% endif %}\r
  \r
  {% if obj.type %}\r
  pko:hasProcedureType pkdata:ProcedureType\\/{{obj.type}} ;\r
  {% endif %}\r
\r
  {% if obj.versionNumber %}\r
  pko:versionNumber "{{obj.versionNumber}}"^^xsd:string ;\r
  {% endif %}\r
  \r
  {% if obj.hasProcedureTarget %}\r
  {% for target in obj.hasProcedureTarget %}\r
  pko:hasProcedureTarget [\r
    dcterms:title "{{target.title}}"^^xsd:string ;\r
    dcterms:type "{{target.type}}"^^xsd:string ;\r
    prov:atLocation "{{target.atLocation}}"^^xsd:string ;\r
  ] ;\r
  {% endfor %}\r
  {% endif %}\r
\r
  {% if obj.hasRequirement %}\r
  {% for requirement in obj.hasRequirement %}\r
  pko:hasRequirement {{ renderRequirement(requirement) }} ;\r
  {% endfor %}\r
  {% endif %}\r
\r
  {% if obj.references %}\r
  {{ renderReferences(obj.references) }}\r
  {% endif %}\r
\r
  {% if obj.keyword %}\r
  {% for keyword in obj.keyword %}\r
  dcat:keyword "{{keyword}}"^^xsd:string ;\r
  {% endfor %}\r
  {% endif %}\r
\r
  dcterms:identifier "{{obj.id}}" ;\r
  adms:status pko:{{slugify(obj.status) | capitalize }} ;\r
  dcterms:creator {{user_iri | safe}} ; \r
  dcterms:created "{{obj.created}}"^^xsd:dateTime ;\r
  dcterms:modified "{{obj.modified}}"^^xsd:dateTime .\r
\r
{% if obj.hasRequirement %}\r
  {% for requirement in obj.hasRequirement %}\r
  {{ renderRequiredEntityDefinition(requirement) }}\r
  {% endfor %}\r
{% endif %}\r
\r
{# RENDER ALL PROCEDURE STEPS #}\r
{% for step in obj.hasStep %}\r
{{procedure_iri | safe}} pko:hasStep <{{step['@id'] | safe}}> .\r
{% if loop.index == 1 %}\r
{{procedure_iri | safe}} pko:hasFirstStep <{{step['@id'] | safe}}> .\r
{% endif %}\r
{% if loop.index > 1 %}\r
{%- set prev_step = obj.hasStep[loop.index - 2] -%}\r
<{{prev_step['@id'] | safe}}> pko:nextStep <{{step['@id'] | safe}}> .\r
{% endif %}\r
{{ renderStep(step) }}\r
{% endfor %}`;export{e as default};