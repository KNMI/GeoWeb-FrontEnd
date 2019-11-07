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
  

