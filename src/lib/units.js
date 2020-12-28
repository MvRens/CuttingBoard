const millimetersPerInch = 25.4;
const millimetersPerCentimeter = 10;
const pixelsPerMillimeter = 1;



const units = {
  toPixels(value, units)
  {
    return this.toMillimeters(value, units) * pixelsPerMillimeter;
  },


  toMillimeters(value, units)
  {
    switch (units)
    {
      case 'mm': return value;
      case 'cm': return value * millimetersPerCentimeter;
      case 'inch': return value * millimetersPerInch;
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
      case 'inch': return value / millimetersPerInch;
    }

    console.error('Invalid units type: ' + units);
    return 0;
  }
};


export { units }