import EditService from '@/components/service/edit';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {prisma as dbContext} from '@/lib/prisma';
import {getAllCloudServices} from '@/lib/cloud-store';

async function EditServicePage({params}: {params: Promise<{slug: string}>}) {
  const resolvedParams = (await params).slug;

  let fetchedService: any = null;
  try {
    fetchedService = await dbContext.service.findFirst({
      where: {slug: resolvedParams},
      include: {
        reviews: {
          include: {client: {select: {id: true, name: true, image: true, imageSource: true}}},
        },
        category: true,
        packages: true,
        seller: {
          include: {user: {select: {id: true, name: true, image: true, email: true}}},
        },
        faqs: true,
        tags: true,
      },
    });
  } catch {
    const all = getAllCloudServices();
    fetchedService = all.find(s => s.slug === resolvedParams) || null;
  }

  if (fetchedService) {
    const formattedService = {
      ...fetchedService,
      seller: {
        ...fetchedService.seller,
        bio: fetchedService.seller?.bio ?? undefined,
        profilePhoto: fetchedService.seller?.profilePhoto ?? undefined,
      },
    };

    return <EditService service={formattedService} />;
  }

  return (
    <div className="grid grid-cols-1 justify-center items-center min-h-[84vh] mx-auto">
      <Alert className="h-fit" variant="destructive">
        <AlertTitle>Service not found</AlertTitle>
        <AlertDescription>This link does not correlate with our service.</AlertDescription>
      </Alert>
    </div>
  );
}

export default EditServicePage;
