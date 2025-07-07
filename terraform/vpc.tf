# terraform/vpc.tf
# VPC, subnets, internet gateway, and networking

resource "aws_vpc" "squeak_vpc" {
    cidr_block           = "10.0.0.0/16"
    instance_tenancy     = "default"
    enable_dns_hostnames = true
    
    tags = {
        Name = "squeak-vpc"
    }
}

resource "aws_subnet" "squeak_sn1" {
    cidr_block              = "10.0.1.0/24"
    vpc_id                  = aws_vpc.squeak_vpc.id
    availability_zone       = "us-east-1a"
    map_public_ip_on_launch = true
    
    tags = {
        Name = "squeak-subnet-1"
    }
}

resource "aws_subnet" "squeak_sn2" {
    cidr_block              = "10.0.2.0/24"
    vpc_id                  = aws_vpc.squeak_vpc.id
    availability_zone       = "us-east-1b"
    map_public_ip_on_launch = true
    
    tags = {
        Name = "squeak-subnet-2"
    }
}

resource "aws_subnet" "squeak_sn3" {
    cidr_block              = "10.0.3.0/24"
    vpc_id                  = aws_vpc.squeak_vpc.id
    availability_zone       = "us-east-1c"
    map_public_ip_on_launch = true
    
    tags = {
        Name = "squeak-subnet-3"
    }
}

# Internet Gateway
resource "aws_internet_gateway" "squeak_igw" {
    vpc_id = aws_vpc.squeak_vpc.id
    
    tags = {
        Name = "squeak-igw"
    }
}

# Route Table
resource "aws_route_table" "squeak_public_rt" {
    vpc_id = aws_vpc.squeak_vpc.id
    
    route {
        cidr_block = "0.0.0.0/0"
        gateway_id = aws_internet_gateway.squeak_igw.id
    }
    
    tags = {
        Name = "squeak-public-rt"
    }
}

# Route Table Associations
resource "aws_route_table_association" "squeak_sn1" {
    subnet_id      = aws_subnet.squeak_sn1.id
    route_table_id = aws_route_table.squeak_public_rt.id
}

resource "aws_route_table_association" "squeak_sn2" {
    subnet_id      = aws_subnet.squeak_sn2.id
    route_table_id = aws_route_table.squeak_public_rt.id
}

resource "aws_route_table_association" "squeak_sn3" {
    subnet_id      = aws_subnet.squeak_sn3.id
    route_table_id = aws_route_table.squeak_public_rt.id
}