'use client';

export function AccordionLogger({id}: {id: string}) {
  return (
    <div
      data-logger
      onClick={() => {
        console.log('Accordion opened:', id);
      }}
    />
  );
}
