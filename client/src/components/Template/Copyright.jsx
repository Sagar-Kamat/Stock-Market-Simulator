import React from "react";
import { Typography } from "@material-ui/core/";

const Copyright = () => {
  return (
    <div>
      <Typography variant="body2" color="textSecondary" align="center">
        {"Copyright © "}
        
          Stonks{"\t"}
        
        {new Date().getFullYear()}
        {"."}
      </Typography>
      <br />
      <Typography variant="body2" color="textSecondary" align="center">
        This simulator is for entertainment & educational purposes only and uses
        fake money.
      </Typography>
      <Typography variant="body2" color="textSecondary" align="center">
        The simulator is not representative of real-world trading conditions and
        the data is not guaranteed to be accurate.
      </Typography>
    </div>
  );
};

export default Copyright;
