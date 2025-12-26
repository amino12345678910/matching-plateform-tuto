//////
///
//

import EditService from '@/components/service/edit';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {prisma as dbContext} from '@/lib/prisma';

async function EditServicePage({params}: {params: Promise<{slug: string}>}) {
  const resolvedParams = (await params).slug;

  if (resolvedParams.length < 0) {
    console.log('string nahi h yee', resolvedParams);
  } else {
    const fetchedService = await dbContext.service.findFirst({
      where: {slug: resolvedParams},
      include: {
        reviews: {include: {user: {select: {id: true, name: true, image: true}}}},
        category: true,
        packages: true,
        seller: {
          include: {user: {select: {id: true, name: true, image: true, email: true}}},
        },
        faqs: true,
        tags: true,
      },
    });

    if (fetchedService) {
      const formattedService = {
        ...fetchedService,
        seller: {
          ...fetchedService.seller,
          bio: fetchedService.seller.bio ?? undefined,
          profilePhoto: fetchedService.seller.profilePhoto ?? undefined,
        },
      };

      // console.log('Reached detailed page', formattedService);
      return <EditService service={formattedService} />;
    } else
      return (
        <div className="grid grid-cols 1 justify-center items-center min-h-[84vh] mx-auto">
          <Alert className="h-fit" variant="destructive">
            <AlertTitle>Service not found</AlertTitle>
            <AlertDescription>This link does not correlate with our service.</AlertDescription>
          </Alert>
        </div>
      );
  }
}

export default EditServicePage;
