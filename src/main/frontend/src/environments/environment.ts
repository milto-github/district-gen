// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  // Voting Districts
  geoJSON_url_v_maryland: '../assets/MarylandVotingDistricts.geojson',
  geoJSON_url_v_westvirginia: '../assets/WestVirginiaVotingDistricts.geojson',
  geoJSON_url_v_virginia: '../assets/VirginiaVotingDistricts.geojson',
  // Congressional Districts
  geoJSON_url_c_maryland: '../assets/MarylandCongressionalDistricts.geojson',
  geoJSON_url_c_westvirginia: '../assets/WestVirginiaCongressionalDistricts.geojson',
  geoJSON_url_c_virginia: '../assets/VirginiaCongressionalDistricts.geojson',
  // States
  geoJSON_url_s_maryland: '../assets/MarylandStateBoundary.geojson',
  geoJSON_url_s_westvirginia: '../assets/WestVirginiaStateBoundary.geojson',
  geoJSON_url_s_virginia: '../assets/VirginiaStateBoundary.geojson'
};
