const UnitsEnum = {
  mm: 'mm',
  cm: 'cm',
  inchdecimal: 'inchdecimal',
  //inchfractional: 'inchfractional'
};


UnitsEnum.isValid = (value) =>
{
  switch (value)
  {
    case UnitsEnum.mm:
    case UnitsEnum.cm:
    case UnitsEnum.inchdecimal:
    //case UnitsEnum.inchfractional:
      return true;

    default:
      return false;
  }
};


const DirectionEnum = {
  uniform: 'uniform',
  alternate: 'alternate',
  custom: 'custom'
};


DirectionEnum.isValid = (value) =>
{
  switch (value)
  {
    case DirectionEnum.uniform:
    case DirectionEnum.alternate:
    case DirectionEnum.custom:
      return value;

    default:
      return DirectionEnum.uniform;
  }
};


export {
  UnitsEnum,
  DirectionEnum
}