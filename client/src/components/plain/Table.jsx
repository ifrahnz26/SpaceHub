import React from 'react';

const Table = React.forwardRef(({ className = '', ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={`w-full caption-bottom text-sm ${className}`}
      {...props}
    />
  </div>
));

const TableHeader = React.forwardRef(({ className = '', ...props }, ref) => (
  <thead ref={ref} className={`[&_tr]:border-b ${className}`} {...props} />
));

const TableBody = React.forwardRef(({ className = '', ...props }, ref) => (
  <tbody
    ref={ref}
    className={`[&_tr:last-child]:border-0 ${className}`}
    {...props}
  />
));

const TableFooter = React.forwardRef(({ className = '', ...props }, ref) => (
  <tfoot
    ref={ref}
    className={`border-t bg-muted/50 font-medium [&>tr]:last:border-b-0 ${className}`}
    {...props}
  />
));

const TableRow = React.forwardRef(({ className = '', ...props }, ref) => (
  <tr
    ref={ref}
    className={`
      border-b transition-colors hover:bg-muted/50 
      data-[state=selected]:bg-muted ${className}
    `}
    {...props}
  />
));

const TableHead = React.forwardRef(({ className = '', ...props }, ref) => (
  <th
    ref={ref}
    className={`
      h-12 px-4 text-left align-middle font-medium 
      text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}
    `}
    {...props}
  />
));

const TableCell = React.forwardRef(({ className = '', ...props }, ref) => (
  <td
    ref={ref}
    className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}
    {...props}
  />
));

const TableCaption = React.forwardRef(({ className = '', ...props }, ref) => (
  <caption
    ref={ref}
    className={`mt-4 text-sm text-muted-foreground ${className}`}
    {...props}
  />
));

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Footer = TableFooter;
Table.Row = TableRow;
Table.Head = TableHead;
Table.Cell = TableCell;
Table.Caption = TableCaption;

export default Table; 