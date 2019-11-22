import moment from 'moment';
import { DATETIME_FORMAT } from '../../config/DayTimeConfig';
/**
 * Check whether the observation or forecast date is valid
 * Rules for OBSorFCS time validity:
 * - it is not mandatory (empty field is valid)
 * - when it is provided, it should be valid date object
 * - now-2h <= OBS time <= now
 * - validityStart <= FCS time <= validityEnd
 * @returns {boolean} The result
 */
export const isObsOrFcValid = (airmetProps) => {
  const { validdate, validdate_end: validdateEnd, obs_or_forecast: obsOrForecastObject } = airmetProps.airmet;
  const obsFcTime = obsOrForecastObject && obsOrForecastObject.obsFcTime ? moment(obsOrForecastObject.obsFcTime) : null;
  const isObserved = obsOrForecastObject ? obsOrForecastObject.obs : null;
  if (!obsFcTime) return true;
  if (!moment(obsFcTime, DATETIME_FORMAT).isValid()) return false;
  const now = moment.utc().seconds(0).milliseconds(0);
  const obsFcTimeNew = moment(obsFcTime).utc().seconds(0).milliseconds(0);
  const obsFcTime2Hour = moment(now).add(-2, 'hour');
  if (isObserved) {
    return obsFcTimeNew.isSameOrAfter(obsFcTime2Hour) && obsFcTimeNew.isSameOrBefore(now);
  } else {
    return obsFcTimeNew.isSameOrAfter(moment(validdate).seconds(0).milliseconds(0)) &&
      obsFcTimeNew.isSameOrBefore(moment(validdateEnd).seconds(0).milliseconds(0));
  }
};

/**
 * Check whether the validity start datetime is valid
 * Rules for validity start time:
 * - it is mandatory (empty field is not valid)
 * - it should be valid date object
 * - validityStart >= now && validityStart <= (now+maxHoursInAdvance) if FCS phenomenon
 * - validityStart >= (now-2h) && validityStart <= (now+maxHoursInAdvance) if OBS phenomenon
 * @returns {boolean} The result
 */
export const isStartValidityTimeValid = (airmetProps) => {
  const { validdate: validateStart, obs_or_forecast: obsOrForecastObject } = airmetProps.airmet;
  const { maxHoursInAdvance } = airmetProps;
  const isObserved = obsOrForecastObject ? obsOrForecastObject.obs : null;
  if (!validateStart) {
    return false;
  }
  const startValidityTimeNew = moment(validateStart).utc().seconds(0).milliseconds(0);
  const now = moment.utc().seconds(0).milliseconds(0);
  const now2Hour = moment(now).add(-2, 'hour');
  const maxStartValidityTime = now.clone().add(maxHoursInAdvance, 'hour').endOf('minute');
  if (isObserved) {
    return startValidityTimeNew.isSameOrAfter(now2Hour) &&
      startValidityTimeNew.isSameOrBefore(maxStartValidityTime);
  } else {
    return startValidityTimeNew.isSameOrAfter(now) &&
      startValidityTimeNew.isSameOrBefore(maxStartValidityTime);
  }
};

/**
 * Check whether the validity end datetime is valid
 * Rules for validity end time:
 * - it is mandatory (empty field is not valid)
 * - it should be valid date object
 * - validityEnd > validityStart && validityEnd <= (validityStart+maxHoursDuration)
 * @returns {boolean} The result
 */
export const isEndValidityTimeValid = (airmetProps) => {
  const { validdate: validateStart, validdate_end: validdateEnd } = airmetProps.airmet;
  const { maxHoursDuration } = airmetProps;
  if (!validdateEnd || !validateStart) {
    return false;
  }
  const endValidityTimeNew = moment(validdateEnd).utc().seconds(0).milliseconds(0);
  const startValidityTimeNew = moment(validateStart).utc().seconds(0).milliseconds(0);
  const maxEndValidityTime = startValidityTimeNew.clone().add(maxHoursDuration, 'hour').endOf('minute');
  return endValidityTimeNew.isAfter(startValidityTimeNew) &&
    endValidityTimeNew.isSameOrBefore(maxEndValidityTime);
};
