# terraform/vpc.tf
# VPC, subnets, internet gateway, and networking

resource "aws_vpc" "vpc" {
    cidr_block           = "10.0.0.0/16"
    instance_tenancy     = "default"
    enable_dns_hostnames = true
    
    tags = {
        Name = "app-vpc"
    }
}

resource "aws_subnet" "sn1" {
    cidr_block              = "10.0.1.0/24"
    vpc_id                  = aws_vpc.vpc.id
    availability_zone       = "us-east-1a"
    map_public_ip_on_launch = true
    
    tags = {
        Name = "app-subnet-1"
    }
}

resource "aws_subnet" "sn2" {
    cidr_block              = "10.0.2.0/24"
    vpc_id                  = aws_vpc.vpc.id
    availability_zone       = "us-east-1b"
    map_public_ip_on_launch = true
    
    tags = {
        Name = "app-subnet-2"
    }
}

resource "aws_subnet" "sn3" {
    cidr_block              = "10.0.3.0/24"
    vpc_id                  = aws_vpc.vpc.id
    availability_zone       = "us-east-1c"
    map_public_ip_on_launch = true
    
    tags = {
        Name = "app-subnet-3"
    }
}

resource "aws_security_group" "sg" {
    name   = "app-sg"
    vpc_id = aws_vpc.vpc.id
    
    # Ingress rules (incoming traffic)
    ingress {
        description = "HTTP"
        from_port   = 80
        to_port     = 80
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }
    
    ingress {
        description = "HTTPS"
        from_port   = 443
        to_port     = 443
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }
    
    ingress {
        description = "App Port"
        from_port   = 8080
        to_port     = 8080
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }
    
    ingress {
        description = "SSH"
        from_port   = 22
        to_port     = 22
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }
    
    # Egress rules (outgoing traffic)
    egress {
        description = "All outbound traffic"
        from_port   = 0
        to_port     = 0
        protocol    = "-1"
        cidr_blocks = ["0.0.0.0/0"]
    }
    
    tags = {
        Name = "app-security-group"
    }
}

# Internet Gateway
resource "aws_internet_gateway" "igw" {
    vpc_id = aws_vpc.vpc.id
    
    tags = {
        Name = "app-igw"
    }
}

# Route Table
resource "aws_route_table" "public" {
    vpc_id = aws_vpc.vpc.id
    
    route {
        cidr_block = "0.0.0.0/0"
        gateway_id = aws_internet_gateway.igw.id
    }
    
    tags = {
        Name = "public-rt"
    }
}

# Route Table Associations
resource "aws_route_table_association" "sn1" {
    subnet_id      = aws_subnet.sn1.id
    route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "sn2" {
    subnet_id      = aws_subnet.sn2.id
    route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "sn3" {
    subnet_id      = aws_subnet.sn3.id
    route_table_id = aws_route_table.public.id
}
