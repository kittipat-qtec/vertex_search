Cloud Storage API pricing
This document discusses pricing for Cloud Storage. For Google Drive, which offers simple online storage for your personal files, see Google Drive pricing.

If you pay in a currency other than USD, the prices listed in your currency on Cloud Platform SKUs apply.

Overview
Cloud Storage pricing is based on the following components:

Data storage: the amount of data stored in your buckets. Storage rates vary depending on the storage class of your data and location of your buckets.
Data processing: the processing done by Cloud Storage, which includes operations charges, any applicable retrieval fees, and inter-region replication.
Network usage: the amount of data read from or moved between your buckets.
Anywhere Cache: On-demand accelerated read cache for your buckets.
Rapid Bucket: High performance object storage in a zonal bucket.
Pricing tables
The pricing tables below show what charges apply when using Cloud Storage.

For example scenarios that show usage and charges, see the Pricing examples page. For the Google Cloud pricing calculator, see the Calculator page.

Data storage

Click on a geographic area to view the at-rest costs for associated locations:

Region

Iowa (us-central1)

Hourly

Monthly
Standard storage

Nearline storage

Coldline storage

Archive storage

Anywhere Cache storage

$0.000027397 / 1 gibibyte hour, per 1 month / account	$0.000013699 / 1 gibibyte hour	$0.000005479 / 1 gibibyte hour	$0.000001644 / 1 gibibyte hour	$0.0003 / 1 gibibyte hour
If you pay in a currency other than USD, the prices listed in your currency on Cloud Platform SKUs apply.

Dual-region

Iowa (us-central1)

Hourly

Monthly
Standard storage

Nearline storage

Coldline storage

Archive storage

$0.000030137 / 1 gibibyte hour	$0.000015068 / 1 gibibyte hour	$0.000006027 / 1 gibibyte hour	$0.000001918 / 1 gibibyte hour
If you pay in a currency other than USD, the prices listed in your currency on Cloud Platform SKUs apply.

Multi-region

Asia (asia)

Hourly

Monthly
Standard storage

Nearline storage

Coldline storage

Archive storage

$0.000035616 / 1 gibibyte hour	$0.000020548 / 1 gibibyte hour	$0.000011986 / 1 gibibyte hour	$0.00000411 / 1 gibibyte hour
If you pay in a currency other than USD, the prices listed in your currency on Cloud Platform SKUs apply.

Zonal

Iowa (us-central1)

Hourly

Monthly
Rapid storage

$0.000150685 / 1 gibibyte hour
If you pay in a currency other than USD, the prices listed in your currency on Cloud Platform SKUs apply.

Dual-regions are billed to both underlying regions at the above prices. For example, Standard storage in a dual-region comprised of Iowa and Oregon will be billed at $0.022 per GB per month for the us-central1 dual-region SKU and $0.022 per GB per month for the us-west1 dual-region SKU. The six predefined dual-regions asia1, eur4, eur5, eur7, eur8, and nam4 bill usage against their locational SKUs at the prices listed.

Data storage charges are prorated to the sub-second for each object, and data storage rates are based on the storage class of each object, not the default storage class set on the bucket that contains them. Data storage charges apply in the same way to live objects, noncurrent objects, and soft-deleted objects.

In addition to the data contained in your uploaded objects, the following count toward your monthly storage usage:

Custom metadata. For example, for the custom metadata NAME:VALUE, Cloud Storage counts each character in NAME and VALUE as a byte stored with the object.
Uploaded parts of an XML API multipart upload, until the multipart upload is either completed or aborted.
Minimum storage duration
A minimum storage duration applies to data stored using Nearline storage, Coldline storage, or Archive storage.

The following table shows the minimum storage duration for each storage class:

Standard storage

Nearline storage

Coldline storage

Archive storage

Rapid storage

None

30 days

90 days

365 days

None

If you pay in a currency other than USD, the prices listed in your currency on Cloud Platform SKUs apply.

You can delete, replace, or move an object before it has been stored for the minimum duration, but at the time you delete, replace, or move the object, you are charged as if the object was stored for the minimum duration. See the early deletion example to see how charges apply.

Note the following regarding minimum storage durations and early deletion charges:

Early deletion charges are billed through early delete SKUs.
Early deletion charges apply when rewriting objects, such as when you change an object's storage class, because a rewrite replaces the existing object.
Early deletion charges do not apply in the following cases:
When Object Lifecycle Management changes an object's storage class.
When the object exists in a bucket that has Autoclass enabled.
In buckets that use Object Versioning, early deletion charges apply when a noncurrent object is deleted, not when it became noncurrent. That object will become soft deleted if soft delete is enabled. Otherwise it will be permanently deleted.
In buckets that use soft delete, early deletion charges apply when an object is soft deleted. These charges are reduced based on the length of the soft delete retention duration.
For XML API multipart uploads, a part is subject to early deletion charges if it's not used when assembling the final object, or if the part is overwritten by another part, or if the multipart upload is aborted.
The storage duration for each part in a multipart upload begins at the time the upload of the part completes, and the storage duration for the overall object begins when the object is assembled.
Tags
Each tag that you attach to a bucket is charged at $0.005 per month.

Data processing

Data processing costs consist of the following:

Operation charges for all requests made to Cloud Storage
Retrieval fees for reading data stored in certain storage classes
Inter-region replication charges for data written to dual-regions and multi-regions
Autoclass charges for buckets with Autoclass enabled
Storage Intelligence charges for buckets with Storage Intelligence configured.
Operation charges

Operation charges apply when you perform operations within Cloud Storage. An operation is an action that makes changes to or requests information about resources such as buckets and objects in Cloud Storage.

Operations are divided into three categories: Class A, Class B, and free. See below for a breakdown of which operations fall into each class.

For buckets located in a single region:

Storage Class1

Class A operations, flat namespace

(per 1,000 operations)

Class A operations, hierarchical namespace

(per 1,000 operations)

Class B operations, flat namespace

(per 1,000 operations)

Class B operations, hierarchical namespace

(per 1,000 operations)

Free operations

Standard storage

$0.005	$0.0065	$0.0004	$0.0005	
Free

Nearline Storage and Durable Reduced Availability (DRA) storage



$0.01	$0.013	$0.001	$0.0013	
Free

Coldline storage

$0.02	$0.026	$0.01	$0.013	
Free

Archive storage

$0.05	$0.065	$0.05	$0.065	
Free

If you pay in a currency other than USD, the prices listed in your currency on Cloud Platform SKUs apply.

For buckets located in a dual-region or multi-region:

Storage Class1

Class A operations, flat namespace

(per 1,000 operations)

Class A operations, hierarchical namespace

(per 1,000 operations)

Class B operations, flat namespace

(per 1,000 operations)

Class B operations, hierarchical namespace

(per 1,000 operations)

Free operations

Standard storage

$0.01	$0.013	$0.0004	$0.0005	
Free

Nearline storage and Durable Reduced Availability (DRA) storage

$0.02	$0.026	$0.001	$0.0013	
Free

Coldline storage

$0.04	$0.052	$0.01	$0.013	
Free

Archive storage

$0.10	$0.13	$0.05	$0.065	
Free

If you pay in a currency other than USD, the prices listed in your currency on Cloud Platform SKUs apply.

For buckets located in a zone:

Storage Class1

Class A operations, hierarchical namespace

(per 1,000 operations)

Class B operations, hierarchical namespace

(per 1,000 operations)

Class C operations, hierarchical namespace

(per 1,000 operations)

Class D operations, hierarchical namespace

(per 1,000 operations)

Free operations

Rapid storage

$0.00113	$0.0002	$0.000625	$0.00002	
Free

If you pay in a currency other than USD, the prices listed in your currency on Cloud Platform SKUs apply.

1The storage class for an operation is determined by the following considerations:

When listing buckets in a project, the Class A Standard storage rate always applies.
When an operation applies to a bucket, such as listing the objects in a bucket, the default storage class set for that bucket determines the operation cost.
When an operation applies to a tag, such as attaching or detaching tags, the default storage class set for the tagged bucket determines the operation cost.
When an operation applies to an object, the storage class of that object determines the operation cost. The following are exceptions to this rule:
When changing the storage class of an object, either yourself or with Object Lifecycle Management, the Class A rate associated with the object's destination storage class applies. For example, changing an object from Standard storage to Coldline storage using Object Lifecycle Management counts as a Class A operation and is billed at the Class A operation rate for Coldline storage. Changing storage classes can have a significant billing impact, especially when a high proportion of objects are under 1 MB in size.
When changing the storage class of an object using Autoclass, most transitions are free. However, the Class A Standard storage rate applies for transitions from Coldline storage or Archive storage to Standard storage or Nearline storage.
In buckets with Autoclass enabled, operations are always charged at the Standard storage rate.
In buckets with soft delete enabled, restore operations are always charged at the Standard storage rate.
In buckets that use soft delete, one Class A Standard storage operation is charged per 1,000 objects processed as part of a bulk restore operation, rounded up so that at least one Class A operation is always billed. This is in addition to the operations charge assessed per object restored.

Operations that fall into each class

The following table lists the operations that fall into each class for the JSON API, XML API, and gRPC. Keep in mind the following:

Except as noted in the footnotes, each request is considered one operation, regardless of the content sent or received as part of the request.
Tools such as the Google API console, the Google Cloud CLI, and the Cloud Storage client libraries might use two or more operations to perform a task. For example, when you click on a bucket name in the Google Cloud console, the system performs an operation to get the list of objects in the bucket and a separate operation to get the metadata for the bucket.
The Google API console uses the JSON API to make requests. Other tools might use either or both the JSON API and XML API. Consult the tool's reference documentation for information about the underlying API that it uses.
API or Feature

Class A Operations

Class B Operations

Class C Operations

Class D Operations

Free Operations

JSON API or gRPC

storage.*.insert1

storage.*.patch

storage.*.update

storage.*.setIamPolicy

storage.buckets.list

storage.objects.copy

storage.objects.list

storage.objects.move

storage.buckets.lockRetentionPolicy

storage.notifications.delete

storage.objects.compose

storage.objects.restore

storage.objects.rewrite1

storage.objects.watchAll

storage.projects.hmacKeys.create

storage.projects.hmacKeys.list

storage.*AccessControls.delete

storage.folders.list

storage.folders.rename

storage.*.get

storage.*.getIamPolicy

storage.*.testIamPermissions

storage.*AccessControls.list

storage.notifications.list

Each object change notification2

storage.buckets.getStorageLayout

storage.channels.stop

storage.buckets.delete

storage.objects.delete

storage.projects.hmacKeys.delete

storage.folders.delete

XML API

GET Service

GET Bucket (when listing objects in a bucket)

PUT

POST

GET Bucket (when retrieving bucket configuration or when listing ongoing multipart uploads)

GET Object

HEAD

DELETE

Object Lifecycle Management

SetStorageClass

AbortIncompleteMultipartUpload

Delete

Autoclass

The following storage class transitions:

Coldline to Standard
Archive to Standard
Coldline to Nearline
Archive to Nearline
The following storage class transitions:

Nearline to Standard
Standard to Nearline
Nearline to Coldline
Coldline to Archive
Tags3

Attach a tag

Detach a tag

List tags attached to a bucket

soft delete

Process 1,000 objects during a bulk restore

Restore a soft-deleted object

List soft-deleted objects

Anywhere Cache

Create Cache

Update Cache

Pause Cache

Resume Cache

Get Cache

List Cache

Disable Cache

Rapid Bucket



Create Appendable Object

Open Write Appendable Object

Open Read Appendable Object

Write to Open Object

Read from Open Object



Finalize Appendable Object

Open Read Object with Handle

Open Write Object with Handle

Refresh Read Access Handle

Refresh Write Access Handle

In Hierarchical Namespace buckets, iterative (recursive) folder operations are billed as class A for each child operation. There are two types of iterative folder operations:

Operations that create missing parent folders automatically. Each parent folder created is considered a child operation. This includes the following operations (and their equivalents in the XML API, if applicable):
storage.objects.insert
storage.objects.compose
storage.objects.copy
storage.objects.move
storage.objects.rewrite
storage.objects.restore
storage.managedFolders.insert
storage.folders.insert (when recursive is set to true)
Complete a multipart upload (this is a POST operation in the XML API)
The rename folder operation. Each child folder under the top-level folder being renamed is considered a child operation.
1A rewrite or resumable upload of a single object performed using the JSON API or gRPC is billed as a single Class A operation, even though these actions can require multiple requests to complete.

2Applies specifically to Object Change Notifications. For Pub/Sub notifications, see Pub/Sub pricing.

3Tag operations are not eligible for the Cloud Storage Always Free program.

Note: Generally, you are not charged for operations that return 307, 4xx, or 5xx responses. The exception is 404 responses returned by buckets with Website Configuration enabled and the NotFoundPage property set to a public object in that bucket.

Retrieval fees

A retrieval fee applies when you read, copy, move, or rewrite object data or metadata that is stored using Nearline storage, Coldline storage, or Archive storage. This cost is in addition to any operations charges and network charges associated with reading the data.

The following table shows the retrieval rates for each storage class:

Rapid storage

Standard storage

Nearline storage (USD)

Coldline storage (USD)

Archive storage (USD)

$0

$0

$0.01 / 1 gibibyte	$0.02 / 1 gibibyte	$0.05 / 1 gibibyte
If you pay in a currency other than USD, the prices listed in your currency on Cloud Platform SKUs apply.

Retrieval fees do not apply when an object exists in a bucket that has Autoclass enabled.

Retrieval fees do not apply when restoring soft-deleted objects.

Retrieval fees do not apply for data read from Anywhere Cache.

Inter-region replication

Inter-region replication is billed on a per-GB basis for all data written to buckets located in a dual-region or multi-region location. Writes include puts, rewrites, copies, and any other actions that create new objects.

Inter-region replication fees do not apply when restoring soft-deleted objects.

Click on a geographic area to view the inter-region replication costs for associated locations:

Geographic area

Location

Default replication (per GiB)

Turbo replication (per GiB)

North America

North American dual-regions, including nam4

$0.02	$0.04
US (multi-region)

$0.02	
Not available

Europe

European dual-regions, including eur4, eur5, eur7, and eur8

$0.02	$0.04
EU (multi-region)

$0.02	
Not available

Asia



Asian dual-regions, including asia1

$0.08	$0.11
Asia (multi-region)

$0.08	
Not available

Oceania

Oceania dual-regions

$0.08	$0.12
Autoclass charges

The following additional charges are associated with buckets that use the Autoclass feature:

Autoclass management fee: Buckets that have Autoclass enabled incur a fee of $0.0025 for every 1000 objects stored for 30 days within them.

Objects smaller than 128 kibibytes are not managed by Autoclass and are thus not counted when determining the fee.
The fee is prorated to the millisecond for each object that isn't stored for the 30-day period.
The fee is also prorated to the millisecond when disabling Autoclass.
Soft-deleted objects do not incur this fee.
Autoclass enablement charge: Buckets that enable Autoclass have a one-time charge for configuring existing objects to use Autoclass. This charge applies even if you immediately disable Autoclass and includes the following, as applicable:

Early delete charges for objects that haven't met their minimum storage duration
Retrieval fees for objects not currently in Standard storage
A Class A operation charge for each object in the bucket, in order to transition them to Autoclass pricing and Standard storage
Objects that are smaller than 128 kibibytes, and already stored in Standard storage at the time Autoclass is enabled are excluded from this operation charge
The Autoclass enablement charge does not apply to soft-deleted objects, which retain their existing storage classes and are billed as such until the end of their soft delete retention duration.

Network

Outbound data transfer represents data sent from Cloud Storage in HTTP responses. Data or metadata read from a Cloud Storage bucket are examples of data transfer.

Inbound data transfer represents data sent to Cloud Storage in HTTP requests. Data or metadata written to a Cloud Storage bucket are examples of inbound data transfer.

Network usage charges apply for data transfer and are divided into the following cases:

Data transfer within Google Cloud, when data transfer is to other Cloud Storage buckets or to Google Cloud services.
Specialty network services, when data transfer uses certain Google Cloud network products.
General data transfer, when data transfer is out of Google Cloud or between continents.
Data transfer within Google Cloud

Data transfer within Google Cloud applies when you move or copy data from one Cloud Storage bucket to another or when another Google Cloud service accesses data in your Cloud Storage bucket.

The following cases of data transfer from a Cloud Storage bucket to within Google Cloud are free:

Case

Examples

Notes

Data moves within the same location.

UA-EAST1-A to US-EAST1-B
US-EAST1 to US-EAST1
EU to EU
A region is not considered the same location as a multi-region, even if the region is within the geographic limits of a multi-region.

Data moves from different zones within the same region are considered within the same location.

For data transfer out to BigQuery datasets, Cloud Storage will consider BigQuery US to be equivalent to us-central1 and BigQuery EU to be equivalent to europe-west4. As an example, no data transfer out charges will be assessed when BigQuery US reads data from a bucket in us-central1, or from a dual-region bucket with one region set as us-central1. However, data transfer out charges will apply when BigQuery US reads data from any other Cloud Storage bucket.

Data moves from a Cloud Storage bucket located in a dual-region to a different Google Cloud service located in one of the regions that make up the dual-region.

Accessing data in an NAM4 bucket with an US-CENTRAL1 GKE instance
This case does not include bucket-to-bucket data moves.

If you pay in a currency other than USD, the prices listed in your currency on Cloud Platform SKUs apply.

You can use Anywhere Cache to avoid data transfer fees associated with multi-region buckets on reads, once data is ingested into the cache.

For all other data transfer from your Cloud Storage buckets to within Google Cloud, pricing is determined by the bucket's location and the destination location, as defined in the following matrix:

Destination location →

Bucket location ↓

Northern America

Europe

Asia

Indonesia

Oceania

Middle East

Latin America

Africa

Northern America

$0.02	$0.05	$0.08	$0.10	$0.10	$0.11	$0.14	$0.11
Europe

$0.05	$0.02	$0.08	$0.10	$0.10	$0.11	$0.14	$0.11
Asia

$0.08	$0.08	$0.08	$0.10	$0.10	$0.11	$0.14	$0.11
Indonesia

$0.10	$0.10	$0.10	
N/A

$0.08	$0.11	$0.14	$0.14
Oceania

$0.10	$0.10	$0.10	$0.08	$0.08	$0.11	$0.14	$0.14
Middle East

$0.11	$0.11	$0.11	$0.11	$0.11	$0.08	$0.14	$0.11
Latin America

$0.14	$0.14	$0.14	$0.14	$0.14	$0.14	$0.14	$0.14
Africa

$0.11	$0.11	$0.11	$0.14	$0.14	$0.11	$0.14	
N/A

Prices are in per GiB units

Specialty network services

If you have chosen to use certain Google Cloud network products, data transfer pricing is based on their pricing tables:

For Cloud CDN, Cloud Storage data transfer charges are waived, but cache fill charges may apply. For more information, see Cloud CDN pricing.
For Media CDN, Cloud Storage data transfer charges are waived. For more information, contact sales.
For CDN Interconnect, see CDN Interconnect pricing.
For Cloud Interconnect, see Cloud Interconnect pricing. For more information, see the Cloud Interconnect overview.
For Direct Peering, see Direct Peering pricing.
General network usage

General network usage applies for any data read from your Cloud Storage bucket that does not fall into one of the above categories or the Always Free usage limits. For example, general network usage applies when data moves from a Cloud Storage bucket to the Internet. You can view your current usage in the billing details for your project.

Item

Price (USD)

Data transfer to Worldwide Destinations (excluding Asia & Australia)

(per GB)

0 gibibyte to 10 tebibyte
$0.12 / 1 gibibyte, per 1 month / account
10 tebibyte to 150 tebibyte
$0.11 / 1 gibibyte, per 1 month / account
150 tebibyte and above
$0.08 / 1 gibibyte, per 1 month / account
Data transfer to Asia Destinations (excluding China, but including Hong Kong)

(per GB)

0 gibibyte to 10 tebibyte
$0.12 / 1 gibibyte, per 1 month / account
10 tebibyte to 150 tebibyte
$0.11 / 1 gibibyte, per 1 month / account
150 tebibyte and above
$0.08 / 1 gibibyte, per 1 month / account
Data transfer to China Destinations (excluding Hong Kong)

(per GB)

0 byte to 1 tebibyte
$0.23 / 1 gibibyte, per 1 month / account
1 tebibyte to 10 tebibyte
$0.22 / 1 gibibyte, per 1 month / account
10 tebibyte and above
$0.20 / 1 gibibyte, per 1 month / account
Data transfer to Australia Destinations (per GB)

0 gibibyte to 10 tebibyte
$0.19 / 1 gibibyte, per 1 month / account
10 tebibyte to 150 tebibyte
$0.18 / 1 gibibyte, per 1 month / account
150 tebibyte and above
$0.15 / 1 gibibyte, per 1 month / account
Inbound data transfer

Free

If you pay in a currency other than USD, the prices listed in your currency on Cloud Platform SKUs apply.

Storage Intelligence

AI-powered Storage Intelligence provides you with insights to help you manage and optimize storage at scale. Generate storage insights datasets specific to your environment by querying object metadata & activity data at scale. Use bucket relocation to minimize application downtime by automatically moving entire buckets while preserving their bucket names. Perform batch operations at scale using managed jobs on millions of objects.

Storage Intelligence charges apply when configuring and using various capabilities as follows:

Trial Tier

The Storage Intelligence 30-day introductory trial lets you learn and explore Storage Intelligence features and capabilities for up to 30 days. After activation, you can use features such as getting data insights with Gemini assistance, Storage Insights datasets, bucket relocation, and storage batch operations. The Storage Intelligence Object Management Fee is waived during the Trial period for the objects in scope of the trial & the Early Termination Fee does not apply during this period. Other charges as outlined below per feature will continue to apply. The Trial tier defaults to the Standard tier at the end of the 30-day period & charges associated with the Standard tier will begin to accrue.

Standard Tier

When configured for Standard tier the Storage Intelligence Standard Object Management Fee ($2.5 per million objects per month) applies to all objects within the specified Organization / Folder / Project. Unless filters are specified all buckets are included even as new ones are added. Any buckets that are removed from Standard Tier within 30 days of inclusion incur Storage Intelligence Early Termination Fee for the remaining duration. Charges are amortized daily and only apply to objects that exist more than 24 hours.

Insights Datasets

These can be configured for the same Organization / Folder / Project as the Storage Intelligence tier. When configured, daily snapshots are delivered for all the buckets/objects that have been enabled with Standard tier. Any number of Datasets can be configured for the same buckets and the Standard tier fee is only applied once.

BigQuery storage fees does apply for every instance for Datasets. Typically 1 TB of Cloud Storage data generates 300 MB of metadata daily however this can vary based on custom metadata stored within objects. Customers can configure the duration of snapshot retention. If Storage Intelligence is disabled for a project then new snapshots will not be delivered however the existing BigQuery data will not be deleted and will continue to incur storage charges. Customers can delete the Datasets configuration at any time to remove their data from BigQuery.

Note: Active Logical Storage charges in BigQuery will be waived for 90 days after the GA launch date for the data stored in the following new views: object_events_view, bucket_activity_view, project_activity_view, and bucket_region_activity_view. After this 90-day promotional period post the GA launch, standard BigQuery storage fees will be charged for these views. All other BigQuery storage remains subject to standard charges.

Note: This will not impact the active logical storage charges for existing metadata tables (bucket_attributes_latest_snapshot_view, bucket_attributes_view, error_attributes_view, events_view, object_attributes_latest_snapshot_view, object_attributes_view, project_attributes_view) which will continue to accrue active logical storage costs.

Storage batch operations

Storage Batch Operations is exclusively available to Storage Intelligence customers. There are no additional charges for using Batch Operations beyond the subscription fee of Storage Intelligence.
Operations charges: All operations performed by Batch Operations incur operations charges based on the storage class of the object being acted on.
Deletions performed by Batch Operations do not incur any charges.
All transformations performed by Batch Operations, except object deletions, incur a Class B operation charge.
All transformations performed by Batch Operations, except object deletions, incur a Class A operations charge. This operation charge does not apply if the object is already in the desired end state.
Batch operations jobs, including dry-run, may require listing bucket contents. You incur Class A operation charges when batch operations perform a list operation. A single list operation can retrieve a maximum of 1000 objects per bucket.

Bucket relocation

When using bucket relocation, a $0.04 per GB charge applies for all data successfully moved to the destination. In addition, the following charges apply:

Storage Intelligence: Bucket relocation is a premium feature offered as a part of Storage Intelligence. Storage Intelligence must be enabled on the source bucket to use bucket relocation.
Data transfer charges: You pay inter-region data transfer charges for moving the data from the source to the destination region. Data transfer is charged per GB of data moved.
Operation charges: You pay one Class A operation per object moved. Additional Class A operations are charged to resynchronize object metadata for objects whose metadata have been updated since the move started. This can mean up to N additional Class A operations for an object updated N times after the move started.
Data storage charges: You pay for data storage charges in both the source and destination locations while bucket relocation processes the move, temporarily increasing your storage charges. Once the move has completed, you only pay for data storage based on the new, destination location.
Data replication charges: If the destination of the move is a multi-region or dual-region bucket, inter-region replication charges apply since the destination data must be replicated to a remote region.
Data retrieval charges: Retrieval fees are not assessed as part of a bucket relocation.
Early deletion charges: You are not billed early deletion charges for the data cleanup in the source bucket after the move.
Destination→

Source↓

Region

Predefined dual-region

Configurable dual-region

Multi-region

Region

All charges apply

All charges apply

All charges apply except with following changes:

- No data transfer charges if there is any overlap of even a single region between source and destination

All charges apply

Predefined dual-region

All charges apply

All charges apply

All charges apply

All charges apply

Configurable dual-region

All charges apply except with following changes:

- No data transfer charges if there is any overlap of even a single region between source and destination

All charges apply

All charges apply except with following changes:

- No data transfer charges if there is any overlap of even a single region between source and destination.

- Storage charges applied at either the source or the destination location, if the move is within the same multi-region.

All charges apply except with following changes:

- Storage charges applied at either the source or the destination location, if the move is within the same multi-region.

Multi-region

All charges apply

All charges apply

All charges apply except with following changes:

- Storage charges applied at either the source or the destination location, if the move is within the same multi-region.

All charges apply

Pricing example for Storage Intelligence

If you have 1000 objects in 1000 buckets that are distributed over 10 projects and you enable Storage Intelligence for all 10 projects, or at Organization level that includes these 10 projects, then you will be charged a monthly Storage Intelligence Standard Object Management Fee of $2.5 for the 1 million objects (1000 objects x 1000 buckets). Charges are applied to the same project where buckets are present.

These charges are applied daily, with $/million objects rate amortized over 30 days. If you have less than a million objects then the charges are amortized so you only pay for the set of objects that are under management for the duration of their existence (over 24 hours).

A 30-day early termination fee which applies when a bucket is removed from a subscription within 30 days of enrollment. Any bucket deletions do not incur this 30-day early termination fee. If you disable Storage Intelligence after 24 days of enablement (6 days remaining) then for example a total of $0.5 Early Termination Fee will be applied on the 25th day for the 1000 buckets that were removed.

Inventory Reports

Inventory Reports are subject to pricing, where every one million objects contained in an inventory report is charged at the pricing below, dependent upon storage location. For more information about storage locations, see Bucket locations.

Supported locations

Iowa (us-central1)
Price (USD)

Unit

$0.0025	
per one million objects

Asia (asia)
Price (USD)

Unit

$0.0028	
per one million objects

Anywhere Cache

Anywhere Cache pricing is based on the following components:

Cache storage: the amount of data stored in cache
Cache ingest: the amount of data written into the cache
Cache data transfer out: the amount of data read from the cache
Cache data transfer out operations: the amount of read requests served from the cache
Cache management operations: the amount of bucket-level cache management requests (normally not significant on bills)
The following pricing applies to any bucket where Anywhere Cache is enabled. Anywhere Cache pricing is supplemental to the overall service pricing. Unless explicitly stated, the Cloud Storage service prices provided elsewhere in this document continue to apply in addition to Anywhere Cache prices.

When reading data that is not already cached in the same zone where the data is being read, all normal Cloud Storage prices apply for the request (for example: Class B operations and multi-region data transfer out charges). In addition, the cache ingest charge applies to load the data being read into the cache. Once data is in the cache, cache storage charges apply until it is evicted from the cache.

When the data being read in a particular zone is already cached in that zone’s cache, cache operations charges apply for requests instead of the normal higher priced Class B operations. Cache data transfer out charges are also assessed based on the volume of data read.

Bucket-level cache configuration and management requests incur normal Class A or Class B operations, per the table in the Operation section.

Please see the Anywhere Cache documentation for more detailed information on how you can control costs using Anywhere Cache.

Cache Storage Charges

Data cached by Anywhere Cache incur a per-GB, per-hour storage fee, with charges pro-rated to the second for each byte of data. Prices are set by region and are listed under the Anywhere Cache column under Data Storage above.

Cache Data Processing Charges

Charge

Price

Notes

Cache ingest

$0.01 / 1 gibibyte	
Data is ingested and charged in 2 MB increments regardless of request size, unless the end of the object is reached in which case the ingest and ingest charges will stop at end of the object. Metadata-only reads do not trigger cache ingest.

Cache operations

$0.0002 / 1,000 count	
Requests entirely served by the cache incur cache operations charges. Otherwise Class B operations apply.

Cache data transfer out

$0.0008 / 1 gibibyte	
Charged for data read from the cache. This is based on the actual size of the read request, with byte sized granularity.

Rapid Bucket

Rapid Bucket is only available in zonal buckets. Pricing is based on the following components:

Data storage: the amount of data stored in the bucket.
Operation charges: for requests made to the bucket.
Data transfer charges: the amount of data read from or written to the bucket.
Please see the Rapid Bucket documentation for an overview and more detailed information about using Rapid Bucket.

Data Storage Charges

Data storage by Rapid Bucket incur a per-GB, per-hour storage fee, with charges pro-rated to the second for each byte of data. Prices are set by zone and are listed in the Rapid storage row under the Zonal section of the Data Storage pricing table above.

Data Transfer Charges

Charge

Price

Notes

Data transfer out

$0.0006 / 1 gibibyte	
Charged for data read from the bucket. This is based on the actual size of the read request, with byte sized granularity.

Data transfer in

$0.0032 / 1 gibibyte	
Charged for data written to the bucket. This is based on the actual size of the write request, with byte sized granularity.

Pricing notes
Storage and network usage are calculated in JEDEC binary gigabytes (GB), also known as IEC gibibytes (GiB), where 1 JEDEC GB is 230 bytes. Similarly, 1 JEDEC TB is 240 bytes, or 1024 JEDEC GBs.
When rewriting or copying data from one Cloud Storage bucket to another, inter-region replication charges, if applicable, are billed to the billing account associated with the destination bucket. All other applicable charges are billed to the billing account associated with the source bucket.
Data transfer costs and retrieval fees are based on the amount of data accessed, not the size of the entire object. For example, if you request only the first 8 MB of a 100 MB Nearline storage object or if the download connection is broken after 8 MB is served, the data transfer cost and the retrieval fee are based on 8 MB.
Charges accrue daily, but Cloud Storage bills you only at the end of the billing period. You can view unbilled usage in your project's billing page in the Google API console.
For compressed objects that are transcoded during download, storage rates are based on the compressed size of the object. Data transfer rates are based on the uncompressed size of the object.
For buckets with Object Versioning enabled, each noncurrent version of an object is charged at the same rate as the live version of the object.
Cloud Storage also has the storage class Durable Reduced Availability (DRA) storage; however, you should use Standard storage in favor of DRA. Standard storage has lower pricing for operations but otherwise has the same price structure. Standard storage also provides better performance, particularly in terms of availability.
There are no extra costs for using the Storage Transfer Service; however, normal Cloud Storage and external provider costs apply when using the Storage Transfer Service. See Storage Transfer Service pricing for a list of potential costs.
Pricing updates for Cloud Storage took effect on October 1, 2022 and on April 1, 2023.
Cloud Storage Always Free usage limits
As part of the Google Cloud Free Tier, Cloud Storage provides resources that are free to use up to specific limits. These usage limits are available both during and after the free trial period. If you are no longer in the free trial period, usage beyond these Always Free limits is charged according to the pricing tables above.

Resource

Monthly Free Usage Limits1

Standard storage

5 GB-months

Class A Operations

5,000

Class B Operations

50,000

Data transfer

100 GB from North America to each Google Cloud Data transfer destination (Australia and China excluded)

1Cloud Storage Always Free quotas apply to usage in US-WEST1, US-CENTRAL1, and US-EAST1 regions. Usage is aggregated across these 3 regions. Always Free quotas do not apply to Rapid Storage class. Always Free is subject to change. Please see our FAQ for eligibility requirements and other restrictions.

To prevent getting billed for usage beyond the Always Free usage limits, you can set API request caps.