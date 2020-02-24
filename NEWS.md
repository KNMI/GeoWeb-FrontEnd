2020-02-24
* Reintroduced "Report Problem" with link to Google Form.

2020-01-15
* GW-153: Presets can now be shared again.
* GW-268: Added a fix that gives preset layers a correct id which ensures they are loaded and updated correctly

2020-01-14
* GW-285: Add service layers button always available and delete buttons available only if there is some layers (except baselayer and country) added.
* GW-268: Presets are now working again.
* Removed WEBSERVER_URL because it is not used.
* GW-285: Add service layers button always available and delete buttons available only if there is some layers (except baselayer and country) added.
* GW-287: The FE will now make a call to the BE every 15 seconds enquiring if you are still logged in. If not, the headerbar is automatically updated to show that you need to log in.

2020-01-09
* GW-279: During a previous change, a bug was introduced that made it impossible to set a point for AIRMET/SIGMET. This has been resolved and you are now able to draw a point on the map again.
* GW-280: After having drawn a box or polygon, if you press the respective draw button again (either box or polygon) so as to move the drawn figure around or change its shape, a red border was shown around the drawing tools and the TAC was validated incorrectly. This has now been fixed

2020-01-02
* GW-184: Added autofilling of the change and probability groups when entering certain characters. For examplem, when typing 'B' in the change field, it will automatically fill in 'BECMG' as that is the only valid option starting with B.

2019-12-16
* (FIX) GW-267: Disable unused GUI components: report problem button, "Checklist shift", "Monitoring & Triggers", "Reports & logs",
"Draw", "Bin", "Timeseries", and "Progtemp".

2019-12-11
* (FIX) GW-215: Do not persist more than one polygon so that the backend accepts this geometry

2019-11-28
* (FIX) GW-218: Updated SigmetReadMode to say 'Missing end geometry' if the end geometry is missed
* (FIX) GW-218: AIRMET - TAC is currently not updating when deleting the start or end position of the FIR - Fixed this by ensuring the TAC gets an update from the backend if removed so it says 'Missing Geometry' in the example TAC
* Fixed an issue where loads of errors appeared in the log when going over the map with your mouse - from adaguc if no valid coordinates

2019-11-27
* (FIX) GW-218: SIGMET - TAC is currently not updating when deleting the start or end position of the FIR - Fixed this by ensuring the TAC gets an update from the backend if removed so it says 'Missing Geometry' in the example TAC
* (Fix) GW-227: Remove map pin in edit mode for Airmet

2019-11-21
* (FIX) Sigmet & Airmet: The validation rules are not using anymore min and max in Timepicker component but they are in one place (SigmetValidation and AirmetValidation)
* Fix the css for Airmet Validity invalid property of Timepicker

2019-11-20
* (FIX) GW-216: Sigmet & Airmet: The obs/fcs is no longer mandatory - if not entered, not validated as incorrect in both edit and read mode. 
* (Fix) GW-214: When creating an Airmet - the obs/fcs time is no longer defaulted in. Instead it is left blank
* (Fix) GW-214: Sigmet & Airmet: When clearing obs/fcs time - it is blanked out instead of adding in a default time
* (FIX) GW-216: Sigmet & Airmet: In read mode and edit mode: the observation time can only be from 2 hours in the past till now.
* (FIX) GW-216: Sigmet & Airmet: In read mode and edit more: the forecast time can only be inside of the validity period
* (FIX) GW-216: Sigmet & Airmet: In edit mode and read mode: the validity start time for forecasted phenomena can only be in the future
* (FIX) GW-216: Sigmet & Airmet: In edit mode and read mode: the validity start time for observed phenomena can be 2 hours in the past or later

2019-11-19
* (Fix) GW-214: Sigmet: validity_end must now be higher than validity_start
* (Fix) GW-214: Sigmet: Forecast time cannot not be in the past, it must start in the future
* (Fix) GW-214: Sigmet: The observation time can now not start in the future 
* (Fix) GW-214: Sigmet: When clearing the observation time, it is set to current
* (Fix) GW-214: Sigmet: When clearing the forecast time, it is set to validity_start
* (Fix) GW-214: Sigmet: When clearing validity_start (with the cross) it is set to current time ('now')
* (Fix) GW-214: Sigmet: When clearing validity_end, it is set to +1 hour from validity start, or if not available it is based on current time.
* (fix) GW-216: Sigmet: Observation or forecast time can now not be empty
* (fix) GW-216: Sigmet: In the Sigmet readmode, the observation or forecast time is validated, and the publish button is disabled when invalid
* (fix) GW-216: Sigmet: In the Sigmet readmode, geometry in the FIR section is validated, and the publish button is disabled when not present

2019-11-18
* (Fix) GW-223: Visibility max value for SFC_VIS phenomenon is set to 9999
* (Fix) GW-224: Added in Airmet Read-Mode the unit field (M) for visibility.
* (Fix) GW-217: Drawing a polyon ouside of the FIR gives an invalid feedback (red border or red font)

2019-11-14
* (Fix) GW-216: It is no longer possible to have a lower level that is higher than the upper level. Shown highlighted in red in both edit and read mode
* GW-216: Improved the user experience in AIRMET read-mode: when the Airmet is not publishable, the mistake is highlighted in red - only for mandatory fields
* (fix) GW-216: Airmet: Observation or forecast time can now not be empty
* (fix) GW-216: Airmet: In the Airmet readmode, the observation or forecast time is validated, and the publish button is disabled when invalid
* (fix) GW-216: Airmet: In the Airmet readmode, geometry in the FIR section is validated, and the publish button is disabled when not present

2019-11-11
* (Fix) GW-214: For both SIGMET and AIRMET, the validity end time can no longer be equal to the start time. The mistake is highlighted in red in both read and edit mode. 
* (Fix) GW-214: For both SIGMET and AIRMET, the entered forecast time is now validated as incorrect if it is in the past. In edit mode, it is highlighed red. 
* (Fix) GW-214: For AIRMET, the observed time could be in the future. This will no longer be validated as correct. It will be highlighted as red in edit mode. 
* (Fix) GW-214: When creating an AIRMET, the observed time is automatically set to the current time
* (Fix) GW-214: Airmet: validity_end must now be higher than validity_start
* (Fix) GW-214: Airmet: Forecast time cannot not be in the past, it must start in the future
* (Fix) GW-214: Airmet: The observation time can now not start in the future 
* (Fix) GW-214: Airmet: When clearing the observation time, it is set to current
* (Fix) GW-214: Airmet: When clearing the forecast time, it is set to validity_start
* (Fix) GW-214: Airmet: When clearing validity_start (with the cross) it is set to current time ('now')
* (Fix) GW-214: Airmet: When clearing validity_end, it is set to +1 hour from validity start, or if not available it is based on current time.

2019-11-11
* Merged master into style/ADAGUC/from_npm
* Hide map pin during sigmet drawing
* Replaced the static adaguc-webmapjs.js file with the new NPM package. This solves an issue for the DWD where they want to add local WMS from their own workstation to GeoWeb-FrontEnd.
* Updated version of adaguc-webmapjs from 3.0.4 to 3.2.25
* Refactored the panelReducer which interacts with adaguc-webmapjs. Replaced cloneDeep with immer's produce where possible
* The redux state was becoming too big by putting the complete WMJSLayer object on the redux state. To prevent this, there is now a cloneWMJSLayerProps method which clone the a WMJSLayer instance properties required for the redux state.
* Removed "Aviation Message Converter" version info

2019-11-07
* Improved the user experience in Sigmet read-mode: when the Sigmet is not publishable, the mistake is highlight in red color

2019-11-06
* (Fix) GW-172: It is not possible anymore to have lower level higher than upper level.
* (Fix) GW-170: Added extra decimal and better explanation in placeholder and tooltip of Lat and Lon for Vulcano
* (Fix) GW-212: Future time is not possible anymore with Observed Sigmet
* (Fix) GW-210: Increased the border thickness around the fields with mistakes in Sigmet Edit mode

2019-11-04
* Added product export viewer, go to /#/exportedproducts

2019-11-01
* Updated tafselector with dropdown and clearer descriptions of TAF statuses
* When baseTime is used in case of amendments, it it displayed in the tafselector
* Frontend crash when amend button clicked is now resolved
* Ability buttons are now always populated.
* When an amended TAF is published, it is not displayed anymore in the TODO list. This is done by using the baseTime instead of validityStart.
* For validityEnd 3124 is now accepted, and it will remain 3124.
* Added refresh taf list button with tooltip

2019-10-31
* (Fix) GW-158: Validity start is directly updated when amend is pressed. This idone by an extra roundtrip to the server.
* (Fix) GW-182: Validation on BECMG groups is now done after amendment
* Delete TAF now works

2019-10-28:

* (Fix) GW-151: A published Taf can be ammended before it is active (before it enters its validity_start). Validity_start will remain the same. Validity period is not changed by the frontend, backend handles value of validity_start
* (Check OK) GW-158: When an active TAF is ammended, validity_start is updated by the backend.
* (Check OK) When an active TAF is corrected, the validity_start remains unchanged
  

