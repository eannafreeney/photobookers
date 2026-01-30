type FormProps = {
  "x-data": string;
  action: string;
  method?: "POST" | "GET" | "PUT" | "DELETE";
  enctype?: "multipart/form-data" | "application/x-www-form-urlencoded";
  children: JSX.Element | JSX.Element[];
};

const Form = ({
  "x-data": xData,
  action,
  method = "POST",
  enctype = "multipart/form-data",
  children,
}: FormProps) => {
  const xTargetAttrs = {
    "x-target.away": "_top",
    "x-target": "notification-message",
  };

  return (
    <form
      x-data={xData}
      action={action}
      method={method}
      enctype={enctype}
      x-on:submit="submitForm($event)"
      {...xTargetAttrs}
    >
      {children}
    </form>
  );
};

export default Form;
