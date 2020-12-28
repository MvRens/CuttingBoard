const millimetersPerInch = 25.4;
const millimetersPerCentimeter = 10;
const pixelsPerMillimeter = 1;



const units = {
  convert(value, fromUnits, toUnits)
  {
    const millimeters = this.toMillimeters(value, fromUnits);
    return this.fromMillimeters(millimeters, toUnits);
  },


  toPixels(value, units)
  {
    return Math.ceil(this.toMillimeters(value, units) * pixelsPerMillimeter);
  },


  toMillimeters(value, units)
  {
    switch (units)
    {
      case 'mm': return value;
      case 'cm': return value * millimetersPerCentimeter;
      case 'inchdecimal': return value * millimetersPerInch;
    }

    console.error('Invalid units type: ' + units);
    return 0;
  },


  fromMillimeters(value, units)
  {
    switch (units)
    {
      case 'mm': return value;
      case 'cm': return value / millimetersPerCentimeter;
      case 'inchdecimal': return value / millimetersPerInch;
    }

    console.error('Invalid units type: ' + units);
    return 0;
  },


  display(value, units)
  {
    const displayValue = this.limitDecimals(value, 3);

    switch (units)
    {
      case 'mm': return displayValue + ' mm';
      case 'cm': return displayValue + ' cm';
      case 'inchdecimal': return displayValue + ' inch';
    }

    console.error('Invalid units type: ' + units);
    return displayValue;
  },


  limitDecimals(value, decimals)
  {
    // toFixed turns it into a string and pads it with zeroes
    const power = Math.pow(10, decimals);
    return Math.round(value * power) / power;
  }
};


export { units }